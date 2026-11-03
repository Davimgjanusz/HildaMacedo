import { format, isValid, parse, parseISO } from "date-fns";

// Funções puras: recebem o texto digitado e devolvem o texto já mascarado.
// Usadas nos campos (MaskedInput) e, na conversão de volta, nos schemas de validação.

const apenasDigitos = (valor) => (valor ?? "").replace(/\D/g, "");

/** Telefone brasileiro: (11) 98888-0000 ou (11) 3333-4444 */
export function mascaraTelefone(valor) {
    const d = apenasDigitos(valor).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Moeda em reais: digitar 12345 vira R$ 123,45 (os dois últimos dígitos são centavos). */
export function mascaraMoeda(valor) {
    const digitos = apenasDigitos(valor).replace(/^0+(?=\d)/, "").slice(0, 12);
    if (!digitos) return "";
    const reais = Number(digitos) / 100;
    const numero = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reais);
    return `R$ ${numero}`;
}

/** Converte o texto mascarado de moeda para número. Retorna NaN se estiver vazio. */
export function parseMoeda(valor) {
    const d = apenasDigitos(valor);
    return d ? Number(d) / 100 : NaN;
}

/** Número (ex.: 8900000) para o texto mascarado (R$ 8.900.000,00). */
export function moedaDeNumero(numero) {
    return mascaraMoeda(String(Math.round(numero * 100)));
}

/** Somente números inteiros, até 6 dígitos. */
export function mascaraInteiro(valor) {
    return apenasDigitos(valor).slice(0, 6);
}

/** Sigla de estado: duas letras maiúsculas. */
export function mascaraUF(valor) {
    return (valor ?? "").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
}

/** Nomes de pessoas e lugares: letras, espaços, hífen e apóstrofo. */
export function mascaraNome(valor) {
    return (valor ?? "").replace(/[^\p{L} '-]/gu, "").slice(0, 80);
}

/** Data: 25122026 vira 25/12/2026. */
export function mascaraData(valor) {
    const d = apenasDigitos(valor).slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** Data DD/MM/AAAA para ISO AAAA-MM-DD. Retorna null se a data não existir no calendário. */
export function dataBrParaIso(valor) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor ?? "")) return null;
    const data = parse(valor, "dd/MM/yyyy", new Date());
    return isValid(data) ? format(data, "yyyy-MM-dd") : null;
}

/** ISO AAAA-MM-DD para DD/MM/AAAA. */
export function isoParaDataBr(iso) {
    return iso ? format(parseISO(iso), "dd/MM/yyyy") : "";
}

/** Competência: 122026 vira 12/2026. */
export function mascaraMesAno(valor) {
    const d = apenasDigitos(valor).slice(0, 6);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}/${d.slice(2)}`;
}

/** Competência MM/AAAA para ISO AAAA-MM. Retorna null se o mês for inválido. */
export function mesAnoParaIso(valor) {
    const m = /^(\d{2})\/(\d{4})$/.exec(valor ?? "");
    if (!m) return null;
    const mes = Number(m[1]);
    return mes >= 1 && mes <= 12 ? `${m[2]}-${m[1]}` : null;
}

/** ISO AAAA-MM para MM/AAAA. */
export function isoParaMesAno(iso) {
    const [ano, mes] = (iso ?? "").split("-");
    return ano && mes ? `${mes}/${ano}` : "";
}
