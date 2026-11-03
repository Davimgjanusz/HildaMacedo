import "server-only";
import https from "node:https";
import { buildBoletoCodes, buildPixCopiaECola } from "./codes";
// Boleto híbrido (bolecode): o mesmo registro devolve linha digitável e Pix copia e cola.
const HOSTS = {
    sandbox: { cobranca: "https://trust-sandbox.api.santander.com.br" },
    production: { cobranca: "https://trust-open.api.santander.com.br" },
};
const PATHS = {
    token: "/auth/oauth/v2/token",
    boletos: (workspaceId) => `/collection_bill_management/v2/workspaces/${workspaceId}/bank_slips`,
    boleto: (workspaceId, id) => `/collection_bill_management/v2/workspaces/${workspaceId}/bank_slips/${id}`,
};
export function getSantanderMode() {
    const env = process.env.SANTANDER_ENV;
    if ((env === "sandbox" || env === "production") && process.env.SANTANDER_CLIENT_ID)
        return env;
    return "mock";
}
// ---------------------------------------------------------------------------
// Transporte HTTP com mTLS
// ---------------------------------------------------------------------------
let agent = null;
function getAgent() {
    if (agent)
        return agent;
    const cert = process.env.SANTANDER_CERT_BASE64;
    const key = process.env.SANTANDER_KEY_BASE64;
    if (!cert || !key)
        throw new Error("Certificado mTLS do Santander não configurado.");
    agent = new https.Agent({
        cert: Buffer.from(cert, "base64"),
        key: Buffer.from(key, "base64"),
        keepAlive: true,
    });
    return agent;
}
function request(url, init) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: init.method, headers: init.headers, agent: getAgent() }, (res) => {
            let raw = "";
            res.setEncoding("utf8");
            res.on("data", (chunk) => (raw += chunk));
            res.on("end", () => {
                const status = res.statusCode ?? 500;
                if (status >= 400) {
                    reject(new SantanderError(status, raw));
                    return;
                }
                try {
                    resolve((raw ? JSON.parse(raw) : {}));
                }
                catch {
                    reject(new SantanderError(status, "Resposta inválida da API Santander."));
                }
            });
        });
        req.on("error", reject);
        if (init.body)
            req.write(init.body);
        req.end();
    });
}
export class SantanderError extends Error {
    status;
    body;
    constructor(status, body) {
        super(`Santander API respondeu ${status}`);
        this.status = status;
        this.body = body;
    }
}
let tokenCache = null;
async function getAccessToken(mode) {
    if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000)
        return tokenCache.value;
    const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.SANTANDER_CLIENT_ID ?? "",
        client_secret: process.env.SANTANDER_CLIENT_SECRET ?? "",
    }).toString();
    const data = await request(HOSTS[mode].cobranca + PATHS.token, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });
    tokenCache = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    return data.access_token;
}
async function authorizedJson(mode, url, method, payload) {
    const token = await getAccessToken(mode);
    return request(url, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            "X-Application-Key": process.env.SANTANDER_CLIENT_ID ?? "",
            "Content-Type": "application/json",
        },
        body: payload ? JSON.stringify(payload) : undefined,
    });
}
// ---------------------------------------------------------------------------
// Operações
// ---------------------------------------------------------------------------
function mockPix(valor, txid) {
    return buildPixCopiaECola({
        chave: process.env.SANTANDER_PIX_KEY || "financeiro@hildamacedo.com.br",
        valor,
        recebedor: "Hilda Macedo Imoveis",
        cidade: "Sao Paulo",
        txid,
    });
}
export async function emitirBoleto(input) {
    const mode = getSantanderMode();
    if (mode === "mock") {
        const { linhaDigitavel, codigoBarras } = buildBoletoCodes({
            convenio: process.env.SANTANDER_COVENANT_CODE || "1234567",
            nossoNumero: input.nossoNumero,
            vencimento: input.vencimento,
            valor: input.valor,
        });
        return {
            nossoNumero: input.nossoNumero,
            linhaDigitavel,
            codigoBarras,
            pixCopiaECola: mockPix(input.valor, input.seuNumero),
        };
    }
    const workspaceId = process.env.SANTANDER_WORKSPACE_ID ?? "";
    const data = await authorizedJson(mode, HOSTS[mode].cobranca + PATHS.boletos(workspaceId), "POST", {
        environment: mode === "production" ? "PRODUCAO" : "TESTE",
        nsuCode: input.seuNumero,
        covenantCode: process.env.SANTANDER_COVENANT_CODE,
        bankNumber: input.nossoNumero,
        clientNumber: input.seuNumero,
        dueDate: input.vencimento,
        nominalValue: input.valor.toFixed(2),
        payer: { name: input.pagador.nome, documentNumber: input.pagador.documento },
        documentKind: "DUPLICATA_MERCANTIL",
        paymentType: "REGISTRO",
        finePercentage: "2.00",
        interestPercentage: "1.00",
        messages: input.mensagem ? [input.mensagem] : [],
        key: { type: "CHAVE_ALEATORIA", dictKey: process.env.SANTANDER_PIX_KEY },
    });
    return {
        nossoNumero: data.bankNumber,
        linhaDigitavel: data.digitableLine,
        codigoBarras: data.barCode,
        pixCopiaECola: data.qrCodePix ?? "",
    };
}
export async function consultarPagamento(nossoNumero) {
    const mode = getSantanderMode();
    if (mode === "mock")
        return { pago: false };
    const workspaceId = process.env.SANTANDER_WORKSPACE_ID ?? "";
    const data = await authorizedJson(mode, HOSTS[mode].cobranca + PATHS.boleto(workspaceId, nossoNumero), "GET");
    return {
        pago: data.status === "LIQUIDADO",
        pagoEm: data.paymentDate,
        valorPago: data.paidValue ? Number(data.paidValue) : undefined,
    };
}
