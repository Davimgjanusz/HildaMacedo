/**
 * Geradores de códigos de cobrança no padrão FEBRABAN / BACEN.
 * Usados pelo modo simulado (mock) e úteis para conferir respostas da API real.
 */
// ---------------------------------------------------------------------------
// Pix — BR Code (EMV® QRCPS-MPM) estático "copia e cola"
// ---------------------------------------------------------------------------
function emv(id, value) {
    return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}
function crc16(payload) {
    let crc = 0xffff;
    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let bit = 0; bit < 8; bit++) {
            crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
            crc &= 0xffff;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
}
function sanitize(text, max) {
    return text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^A-Za-z0-9 ]/g, "")
        .toUpperCase()
        .slice(0, max);
}
export function buildPixCopiaECola(params) {
    const payload = emv("00", "01") +
        emv("26", emv("00", "br.gov.bcb.pix") + emv("01", params.chave)) +
        emv("52", "0000") +
        emv("53", "986") +
        emv("54", params.valor.toFixed(2)) +
        emv("58", "BR") +
        emv("59", sanitize(params.recebedor, 25)) +
        emv("60", sanitize(params.cidade, 15)) +
        emv("62", emv("05", sanitize(params.txid, 25).replace(/ /g, "")));
    const withCrcId = `${payload}6304`;
    return withCrcId + crc16(withCrcId);
}
// ---------------------------------------------------------------------------
// Boleto — código de barras (44) e linha digitável (47)
// ---------------------------------------------------------------------------
const BANCO_SANTANDER = "033";
function mod10(num) {
    let sum = 0;
    let weight = 2;
    for (let i = num.length - 1; i >= 0; i--) {
        const product = Number(num[i]) * weight;
        sum += product > 9 ? Math.floor(product / 10) + (product % 10) : product;
        weight = weight === 2 ? 1 : 2;
    }
    const rest = sum % 10;
    return rest === 0 ? 0 : 10 - rest;
}
function mod11(num) {
    let sum = 0;
    let weight = 2;
    for (let i = num.length - 1; i >= 0; i--) {
        sum += Number(num[i]) * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }
    const dv = 11 - (sum % 11);
    return dv === 0 || dv === 10 || dv === 11 ? 1 : dv;
}
/** Fator de vencimento FEBRABAN, com o reinício de 22/02/2025 (fator volta a 1000). */
function fatorVencimento(vencimento) {
    const base = Date.UTC(1997, 9, 7);
    const [y, m, d] = vencimento.split("-").map(Number);
    const dias = Math.round((Date.UTC(y, m - 1, d) - base) / 86_400_000);
    return dias > 9999 ? ((dias - 10000) % 9000) + 1000 : dias;
}
export function buildBoletoCodes(params) {
    const fator = fatorVencimento(params.vencimento).toString().padStart(4, "0");
    const valor = Math.round(params.valor * 100).toString().padStart(10, "0");
    // Campo livre Santander: 9 + convênio(7) + nosso número(13) + IOS(1) + carteira(3)
    const campoLivre = "9" + params.convenio.padStart(7, "0").slice(-7) + params.nossoNumero.padStart(13, "0").slice(-13) + "0" + "101";
    const semDv = BANCO_SANTANDER + "9" + fator + valor + campoLivre;
    const dvGeral = mod11(semDv);
    const codigoBarras = semDv.slice(0, 4) + dvGeral + semDv.slice(4);
    const campo1 = codigoBarras.slice(0, 4) + codigoBarras.slice(19, 24);
    const campo2 = codigoBarras.slice(24, 34);
    const campo3 = codigoBarras.slice(34, 44);
    const fmt = (c) => `${c.slice(0, 5)}.${c.slice(5)}`;
    const linhaDigitavel = [
        fmt(campo1 + mod10(campo1)),
        fmt(campo2 + mod10(campo2)),
        fmt(campo3 + mod10(campo3)),
        String(dvGeral),
        fator + valor,
    ].join(" ");
    return { codigoBarras, linhaDigitavel };
}
