"use server";
import { z } from "zod";
import { refresh } from "next/cache";
import { authorize } from "@/lib/auth/dal";
import { getToday } from "@/lib/dates";
import { getContractsByTenant } from "@/lib/data/finance";
import { getPropertyById } from "@/lib/data/properties";
import { cancelVisitById, insertTicket, insertVisit, isSlotTaken, nextTicketId } from "@/lib/data/portal";
import { ticketSchema, visitSchema } from "@/lib/validations/portal";
const DENIED = { ok: false, message: "Sessão expirada ou sem permissão. Entre novamente." };
// ---------------------------------------------------------------------------
// Inquilino
// ---------------------------------------------------------------------------
export async function createTicket(input) {
    const user = await authorize("tenant");
    if (!user)
        return DENIED;
    const parsed = ticketSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, message: "Verifique os campos destacados.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }
    const [contrato] = await getContractsByTenant(user.id);
    if (!contrato)
        return { ok: false, message: "Nenhum contrato ativo encontrado para abrir chamados." };
    const id = nextTicketId();
    insertTicket({
        id,
        inquilinoId: user.id,
        imovelId: contrato.imovelId,
        ...parsed.data,
        status: "aberto",
        criadoEm: await getToday(),
    });
    refresh();
    return { ok: true, message: `Chamado ${id} aberto. Você receberá atualizações por e-mail.` };
}
// ---------------------------------------------------------------------------
// Cliente
// ---------------------------------------------------------------------------
export async function scheduleVisit(input) {
    const user = await authorize("client");
    if (!user)
        return DENIED;
    const parsed = visitSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, message: "Verifique os campos destacados.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }
    const { imovelId, data, horario, observacoes } = parsed.data;
    if (data <= (await getToday())) {
        return { ok: false, message: "Escolha uma data a partir de amanhã.", fieldErrors: { data: ["Escolha uma data futura."] } };
    }
    const imovel = await getPropertyById(imovelId);
    if (!imovel || imovel.status !== "disponivel") {
        return { ok: false, message: "Este imóvel não está disponível para visitas." };
    }
    if (isSlotTaken(imovelId, data, horario)) {
        return { ok: false, message: "Horário indisponível. Escolha outro horário.", fieldErrors: { horario: ["Horário já reservado."] } };
    }
    insertVisit({
        id: `vs-${crypto.randomUUID().slice(0, 6)}`,
        clienteId: user.id,
        imovelId,
        data,
        horario,
        observacoes,
        status: "agendada",
    });
    refresh();
    return { ok: true, message: "Visita agendada! Enviaremos a confirmação por e-mail." };
}
export async function cancelVisit(visitId) {
    const user = await authorize("client");
    if (!user)
        return DENIED;
    if (!cancelVisitById(visitId, user.id))
        return { ok: false, message: "Não foi possível cancelar esta visita." };
    refresh();
    return { ok: true, message: "Visita cancelada." };
}
