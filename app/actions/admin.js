"use server";
import { z } from "zod";
import { refresh, updateTag } from "next/cache";
import { authorize } from "@/lib/auth/dal";
import { getToday } from "@/lib/dates";
import { PROPERTIES_TAG, insertProperty, propertyIdExists, removeProperty, replaceProperty, } from "@/lib/data/properties";
import { buildInvoice, getContracts, getInvoices, insertInvoice, nextNossoNumero, setInvoicePaid, } from "@/lib/data/finance";
import { appendMessage, markThreadRead } from "@/lib/data/portal";
import { consultarPagamento, emitirBoleto, getSantanderMode, SantanderError } from "@/lib/santander/client";
import { propertySchema } from "@/lib/validations/property";
import { boletoSchema, messageSchema } from "@/lib/validations/portal";
const DENIED = { ok: false, message: "Sessão expirada ou sem permissão. Entre novamente." };
function invalid(error) {
    return { ok: false, message: "Verifique os campos destacados.", fieldErrors: z.flattenError(error).fieldErrors };
}
function slugify(text) {
    return text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
// ---------------------------------------------------------------------------
// Imóveis
// ---------------------------------------------------------------------------
export async function saveProperty(id, input) {
    if (!(await authorize("admin")))
        return DENIED;
    const parsed = propertySchema.safeParse(input);
    if (!parsed.success)
        return invalid(parsed.error);
    if (id) {
        if (!replaceProperty(id, parsed.data))
            return { ok: false, message: "Imóvel não encontrado." };
    }
    else {
        let newId = slugify(`${parsed.data.tipo} ${parsed.data.bairro}`);
        let n = 2;
        while (propertyIdExists(newId))
            newId = `${slugify(`${parsed.data.tipo} ${parsed.data.bairro}`)}-${n++}`;
        insertProperty({ id: newId, ...parsed.data, criadoEm: await getToday() });
        id = newId;
    }
    updateTag(PROPERTIES_TAG);
    return { ok: true, id, message: "Imóvel salvo com sucesso." };
}
export async function deleteProperty(id) {
    if (!(await authorize("admin")))
        return DENIED;
    const contracts = await getContracts();
    if (contracts.some((c) => c.imovelId === id)) {
        return { ok: false, message: "Este imóvel possui contrato vinculado e não pode ser excluído." };
    }
    if (!removeProperty(id))
        return { ok: false, message: "Imóvel não encontrado." };
    updateTag(PROPERTIES_TAG);
    return { ok: true, message: "Imóvel excluído." };
}
// ---------------------------------------------------------------------------
// Financeiro / Santander
// ---------------------------------------------------------------------------
export async function issueInvoice(input) {
    if (!(await authorize("admin")))
        return DENIED;
    const parsed = boletoSchema.safeParse(input);
    if (!parsed.success)
        return invalid(parsed.error);
    const { contratoId, competencia, vencimento, valor } = parsed.data;
    const contrato = (await getContracts()).find((c) => c.id === contratoId);
    if (!contrato)
        return { ok: false, message: "Contrato não encontrado." };
    const existing = await getInvoices({ inquilinoId: contrato.inquilinoId });
    if (existing.some((i) => i.contratoId === contratoId && i.competencia === competencia && i.status !== "cancelado")) {
        return { ok: false, message: "Já existe um boleto para esta competência.", fieldErrors: { competencia: ["Competência já faturada."] } };
    }
    if (vencimento < (await getToday())) {
        return { ok: false, message: "O vencimento não pode estar no passado.", fieldErrors: { vencimento: ["Data no passado."] } };
    }
    const id = `bl-${contratoId.slice(3)}-${competencia}`;
    try {
        const emitido = await emitirBoleto({
            nossoNumero: nextNossoNumero(),
            seuNumero: id.replace(/[^A-Za-z0-9]/g, "").slice(-15),
            vencimento,
            valor,
            pagador: { nome: contrato.inquilinoNome, documento: "" },
            mensagem: `Aluguel ${competencia} — contrato ${contratoId}`,
        });
        const invoice = buildInvoice({
            id,
            contratoId,
            inquilinoId: contrato.inquilinoId,
            competencia,
            vencimento,
            valor,
            status: "pendente",
            nossoNumero: emitido.nossoNumero,
        });
        // Mantém os códigos devolvidos pelo banco quando a integração real está ativa
        insertInvoice({ ...invoice, linhaDigitavel: emitido.linhaDigitavel, pixCopiaECola: emitido.pixCopiaECola || invoice.pixCopiaECola });
    }
    catch (error) {
        console.error("[santander] falha ao emitir boleto", error);
        const detail = error instanceof SantanderError ? ` (HTTP ${error.status})` : "";
        return { ok: false, message: `O Santander recusou a emissão${detail}. Tente novamente em instantes.` };
    }
    refresh();
    const modo = getSantanderMode() === "mock" ? " (modo simulado)" : "";
    return { ok: true, message: `Boleto emitido e disponível no portal do inquilino${modo}.` };
}
export async function markInvoicePaid(id) {
    if (!(await authorize("admin")))
        return DENIED;
    if (!setInvoicePaid(id, await getToday()))
        return { ok: false, message: "Boleto não encontrado ou já quitado." };
    refresh();
    return { ok: true, message: "Baixa manual registrada." };
}
/** Consulta no Santander todos os boletos em aberto e dá baixa nos liquidados. */
export async function reconcileInvoices() {
    if (!(await authorize("admin")))
        return DENIED;
    if (getSantanderMode() === "mock") {
        return { ok: true, message: "Modo simulado: configure as credenciais do Santander para conciliar automaticamente." };
    }
    const abertos = (await getInvoices()).filter((i) => i.status === "pendente");
    let baixados = 0;
    const falhas = [];
    for (const invoice of abertos) {
        try {
            const status = await consultarPagamento(invoice.nossoNumero);
            if (status.pago && setInvoicePaid(invoice.id, status.pagoEm ?? (await getToday())))
                baixados++;
        }
        catch {
            falhas.push(invoice.id);
        }
    }
    refresh();
    const sufixo = falhas.length ? ` ${falhas.length} consulta(s) falharam.` : "";
    return { ok: falhas.length === 0, message: `Conciliação concluída: ${baixados} boleto(s) liquidado(s).${sufixo}` };
}
// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------
export async function sendMessage(input) {
    if (!(await authorize("admin")))
        return DENIED;
    const parsed = messageSchema.safeParse(input);
    if (!parsed.success)
        return invalid(parsed.error);
    const ok = appendMessage(parsed.data.threadId, {
        id: crypto.randomUUID(),
        autor: "equipe",
        texto: parsed.data.texto,
        enviadoEm: new Date().toISOString(),
    });
    if (!ok)
        return { ok: false, message: "Conversa não encontrada." };
    refresh();
    return { ok: true, message: "Mensagem enviada." };
}
export async function readThread(threadId) {
    if (!(await authorize("admin")))
        return;
    markThreadRead(threadId);
}
