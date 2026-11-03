const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const brlCents = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
export function formatBRL(value, cents = false) {
    return (cents ? brlCents : brl).format(value);
}
export function formatCompactBRL(value) {
    return `R$ ${compact.format(value)}`;
}
/** Formata datas ISO (AAAA-MM-DD) sem conversão de fuso, evitando o "dia anterior". */
export function formatDate(iso) {
    const [y, m, d] = iso.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
}
export function formatDateTime(iso) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
    }).format(new Date(iso));
}
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export function formatCompetencia(comp) {
    const [y, m] = comp.split("-");
    return `${MESES[Number(m) - 1]}/${y}`;
}
export function daysBetween(fromIso, toIso) {
    const toUtc = (iso) => {
        const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
        return Date.UTC(y, m - 1, d);
    };
    return Math.round((toUtc(toIso) - toUtc(fromIso)) / 86_400_000);
}
export function formatPrice(preco, finalidade) {
    return finalidade === "locacao" ? `${formatBRL(preco)}/mês` : formatBRL(preco);
}
export const finalidadeLabel = {
    venda: "Venda",
    locacao: "Locação",
};
export const tipoLabel = {
    apartamento: "Apartamento",
    casa: "Casa",
    cobertura: "Cobertura",
    comercial: "Comercial",
    terreno: "Terreno",
};
export const statusImovelLabel = {
    disponivel: "Disponível",
    reservado: "Reservado",
    vendido: "Vendido",
    alugado: "Alugado",
};
export const statusBoletoLabel = {
    pendente: "Pendente",
    pago: "Pago",
    vencido: "Vencido",
    cancelado: "Cancelado",
};
export const categoriaChamadoLabel = {
    hidraulica: "Hidráulica",
    eletrica: "Elétrica",
    estrutural: "Estrutural",
    eletrodomesticos: "Eletrodomésticos",
    outros: "Outros",
};
export const prioridadeLabel = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
};
export const statusChamadoLabel = {
    aberto: "Aberto",
    em_andamento: "Em andamento",
    concluido: "Concluído",
};
export const statusVisitaLabel = {
    agendada: "Agendada",
    realizada: "Realizada",
    cancelada: "Cancelada",
};
