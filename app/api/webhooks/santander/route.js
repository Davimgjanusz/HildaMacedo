import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getInvoices, setInvoicePaid } from "@/lib/data/finance";
/**
 * Webhook de conciliação: o Santander notifica a liquidação de boletos/Pix.
 * Ajuste `payloadSchema` ao formato do produto contratado (ver portal do desenvolvedor)
 * e, em produção, valide também o certificado mTLS do remetente no proxy reverso.
 */
const payloadSchema = z.object({
    nossoNumero: z.string().min(1),
    status: z.string(),
    dataPagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
});
function authorized(req) {
    const expected = process.env.SANTANDER_WEBHOOK_SECRET;
    const received = req.headers.get("x-webhook-secret");
    if (!expected || !received)
        return false;
    const a = Buffer.from(expected);
    const b = Buffer.from(received);
    return a.length === b.length && timingSafeEqual(a, b);
}
export async function POST(req) {
    if (!authorized(req))
        return Response.json({ error: "unauthorized" }, { status: 401 });
    const parsed = payloadSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
        return Response.json({ error: "invalid payload" }, { status: 400 });
    const { nossoNumero, status, dataPagamento } = parsed.data;
    if (!["LIQUIDADO", "PAGO", "CONCLUIDA"].includes(status.toUpperCase())) {
        return Response.json({ received: true, ignored: status });
    }
    const invoice = (await getInvoices()).find((i) => i.nossoNumero === nossoNumero);
    if (!invoice)
        return Response.json({ error: "not found" }, { status: 404 });
    const updated = setInvoicePaid(invoice.id, (dataPagamento ?? new Date().toISOString()).slice(0, 10));
    return Response.json({ received: true, updated });
}
