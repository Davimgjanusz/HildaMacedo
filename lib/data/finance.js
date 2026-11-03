import "server-only";
import { buildInvoice, db } from "./store";
import { daysBetween } from "@/lib/format";
/** Boletos "pendentes" com vencimento no passado são exibidos como vencidos. */
export function effectiveStatus(invoice, today) {
    if (invoice.status === "pendente" && invoice.vencimento < today)
        return "vencido";
    return invoice.status;
}
/** Multa de 2% + juros de mora de 1% a.m. pro rata die (padrão da Lei do Inquilinato). */
export function updatedAmount(invoice, today) {
    const atraso = Math.max(0, daysBetween(invoice.vencimento, today));
    if (atraso === 0)
        return { valor: invoice.valor, multa: 0, juros: 0, atraso };
    const multa = invoice.valor * 0.02;
    const juros = invoice.valor * (0.01 / 30) * atraso;
    return { valor: invoice.valor + multa + juros, multa, juros, atraso };
}
export async function getContracts() {
    return structuredClone(db.contracts);
}
export async function getContractsByTenant(inquilinoId) {
    return structuredClone(db.contracts.filter((c) => c.inquilinoId === inquilinoId));
}
export async function getInvoices(filter = {}) {
    const list = filter.inquilinoId ? db.invoices.filter((i) => i.inquilinoId === filter.inquilinoId) : db.invoices;
    return structuredClone(list).sort((a, b) => b.vencimento.localeCompare(a.vencimento));
}
export async function getInvoiceById(id) {
    const invoice = db.invoices.find((i) => i.id === id);
    return invoice ? structuredClone(invoice) : null;
}
export function nextNossoNumero() {
    const max = db.invoices.reduce((acc, i) => Math.max(acc, Number(i.nossoNumero)), 0);
    return String(max + 1).padStart(13, "0");
}
export function insertInvoice(invoice) {
    db.invoices.push(invoice);
}
export function setInvoicePaid(id, pagoEm) {
    const invoice = db.invoices.find((i) => i.id === id);
    if (!invoice || invoice.status === "pago")
        return false;
    invoice.status = "pago";
    invoice.pagoEm = pagoEm;
    return true;
}
export { buildInvoice };
export async function getDashboardMetrics(today) {
    const properties = db.properties;
    const competenciaAtual = today.slice(0, 7);
    const vgv = properties
        .filter((p) => p.finalidade === "venda" && (p.status === "disponivel" || p.status === "reservado"))
        .reduce((acc, p) => acc + p.preco, 0);
    const locacao = properties.filter((p) => p.finalidade === "locacao");
    const alugados = locacao.filter((p) => p.status === "alugado").length;
    const ocupacao = locacao.length ? alugados / locacao.length : 0;
    // Inadimplência: valor vencido em aberto sobre o total faturado até hoje.
    const faturado = db.invoices.filter((i) => i.vencimento <= today && i.status !== "cancelado");
    const totalFaturado = faturado.reduce((acc, i) => acc + i.valor, 0);
    const vencidos = db.invoices.filter((i) => effectiveStatus(i, today) === "vencido");
    const valorVencido = vencidos.reduce((acc, i) => acc + i.valor, 0);
    const inadimplencia = totalFaturado ? valorVencido / totalFaturado : 0;
    const receitaMes = db.invoices
        .filter((i) => i.competencia === competenciaAtual && i.status === "pago")
        .reduce((acc, i) => acc + i.valor, 0);
    const previstoMes = db.invoices
        .filter((i) => i.competencia === competenciaAtual && i.status !== "cancelado")
        .reduce((acc, i) => acc + i.valor, 0);
    // Recebimentos por competência (últimos 6 meses)
    const competencias = [...new Set(db.invoices.map((i) => i.competencia))].sort().slice(-6);
    const recebimentos = competencias.map((comp) => {
        const doMes = db.invoices.filter((i) => i.competencia === comp && i.status !== "cancelado");
        return {
            competencia: comp,
            recebido: doMes.filter((i) => i.status === "pago").reduce((acc, i) => acc + i.valor, 0),
            emAberto: doMes.filter((i) => i.status !== "pago").reduce((acc, i) => acc + i.valor, 0),
        };
    });
    return {
        vgv,
        imoveisVenda: properties.filter((p) => p.finalidade === "venda" && p.status !== "vendido").length,
        ocupacao,
        alugados,
        totalLocacao: locacao.length,
        inadimplencia,
        valorVencido,
        boletosVencidos: vencidos.length,
        receitaMes,
        previstoMes,
        recebimentos,
    };
}
