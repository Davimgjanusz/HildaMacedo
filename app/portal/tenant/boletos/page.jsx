import QRCode from "qrcode";
import { Barcode, CheckCircle2, QrCode } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { DataTable } from "@/components/ui/data-table";
import { Badge, Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth/dal";
import { getToday } from "@/lib/dates";
import { effectiveStatus, getInvoices, updatedAmount } from "@/lib/data/finance";
import { formatBRL, formatCompetencia, formatDate } from "@/lib/format";
import { buildPixCopiaECola } from "@/lib/santander/codes";
export const metadata = { title: "Boletos e Pix" };
const historyColumns = [
    { header: "Competência", cell: (i) => formatCompetencia(i.competencia), hideOnCard: true },
    { header: "Vencimento", cell: (i) => formatDate(i.vencimento) },
    { header: "Pago em", cell: (i) => (i.pagoEm ? formatDate(i.pagoEm) : "—") },
    { header: "Valor", cell: (i) => <span className="tabular-nums">{formatBRL(i.valor, true)}</span> },
    { header: "Status", cell: () => <Badge tone="success">Pago</Badge> },
];
export default async function BoletosPage() {
    const user = await requireRole("tenant");
    const [today, invoices] = await Promise.all([getToday(), getInvoices({ inquilinoId: user.id })]);
    const abertos = invoices.filter((i) => i.status === "pendente").sort((a, b) => a.vencimento.localeCompare(b.vencimento));
    const pagos = invoices.filter((i) => i.status === "pago");
    return (<>
      <PageHeader eyebrow="Financeiro" title="Boletos e Pix" description="Gere a 2ª via, copie a linha digitável ou pague instantaneamente com Pix."/>

      <section aria-labelledby="em-aberto" className="space-y-6">
        <h2 id="em-aberto" className="sr-only">Em aberto</h2>
        {abertos.length === 0 && (<Card className="flex items-center gap-3 p-6 text-sm">
            <CheckCircle2 className="size-5 text-success" aria-hidden/>
            Você não possui boletos em aberto.
          </Card>)}
        {abertos.map((invoice) => (<OpenInvoice key={invoice.id} invoice={invoice} today={today}/>))}
      </section>

      <Card className="mt-8">
        <CardHeader title="Histórico de pagamentos"/>
        <DataTable rows={pagos} columns={historyColumns} rowKey={(i) => i.id} caption="Histórico de pagamentos" cardTitle={(i) => <p className="font-medium">Aluguel {formatCompetencia(i.competencia)}</p>}/>
      </Card>
    </>);
}
async function OpenInvoice({ invoice, today }) {
    const status = effectiveStatus(invoice, today);
    const atualizado = updatedAmount(invoice, today);
    // 2ª via de boleto vencido: o Pix é regerado com o valor atualizado (multa + juros).
    // Com a integração real ativa, troque por uma cobrança com vencimento (cobv) emitida na API.
    const pix = status === "vencido"
        ? buildPixCopiaECola({
            chave: process.env.SANTANDER_PIX_KEY || "financeiro@hildamacedo.com.br",
            valor: Number(atualizado.valor.toFixed(2)),
            recebedor: "Hilda Macedo Imoveis",
            cidade: "Sao Paulo",
            txid: `${invoice.id}2via`.replace(/[^A-Za-z0-9]/g, ""),
        })
        : invoice.pixCopiaECola;
    const qrSvg = await QRCode.toString(pix, { type: "svg", margin: 1, color: { dark: "#1a1a1a", light: "#ffffff" } });
    return (<Card id={invoice.id} className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm text-muted">Aluguel de {formatCompetencia(invoice.competencia)} · Nosso nº {invoice.nossoNumero}</p>
          <p className="mt-1 font-sans text-3xl font-semibold tracking-tight tabular-nums">{formatBRL(atualizado.valor, true)}</p>
          {status === "vencido" && (<p className="mt-1 text-xs text-muted">
              Original {formatBRL(invoice.valor, true)} + multa {formatBRL(atualizado.multa, true)} + juros {formatBRL(atualizado.juros, true)} ({atualizado.atraso} dias)
            </p>)}
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          {status === "vencido" ? <Badge tone="danger">Vencido · 2ª via atualizada</Badge> : <Badge tone="warning">Em aberto</Badge>}
          <span className="text-sm text-muted">Vencimento {formatDate(invoice.vencimento)}</span>
        </div>
      </div>

      <div className="grid gap-px bg-line md:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col items-center gap-4 bg-surface p-6 text-center">
          <p className="flex items-center gap-2 text-sm font-medium">
            <QrCode className="size-4 text-sand-dark" aria-hidden/>
            Pague com Pix
          </p>
          <div className="size-48 rounded-xl bg-white p-2 ring-1 ring-line [&_svg]:h-full [&_svg]:w-full" role="img" aria-label="QR Code Pix para pagamento" dangerouslySetInnerHTML={{ __html: qrSvg }}/>
          <p className="text-xs text-muted">Aponte a câmera do app do seu banco. A confirmação é instantânea.</p>
        </div>

        <div className="flex flex-col gap-6 bg-surface p-6">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Pix copia e cola</p>
              <CopyButton value={pix} label="Copiar código Pix" successMessage="Código Pix copiado!"/>
            </div>
            <p className="break-all rounded-lg bg-offwhite p-3 font-mono text-xs leading-relaxed text-muted">{pix}</p>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Barcode className="size-4 text-sand-dark" aria-hidden/>
                Linha digitável
              </p>
              <CopyButton value={invoice.linhaDigitavel.replace(/\D/g, "")} label="Copiar linha digitável" successMessage="Linha digitável copiada!"/>
            </div>
            <p className="break-all rounded-lg bg-offwhite p-3 font-mono text-sm tracking-wide">{invoice.linhaDigitavel}</p>
            {status === "vencido" && (<p className="mt-2 text-xs text-muted">O banco calcula multa e juros automaticamente ao pagar o boleto após o vencimento.</p>)}
          </div>
        </div>
      </div>
    </Card>);
}
