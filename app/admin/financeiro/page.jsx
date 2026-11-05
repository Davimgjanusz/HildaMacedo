import { AlertTriangle, CircleDollarSign, Clock, Plug, Receipt } from "lucide-react";
import { IssueInvoiceForm, MarkPaidButton, ReconcileButton } from "@/components/dashboard/finance-actions";
import { DataTable } from "@/components/ui/data-table";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { Pagination } from "@/components/ui/pagination";
import { Badge, Card, CardHeader, EmptyState, PageHeader, StatCard } from "@/components/ui/primitives";
import { getToday } from "@/lib/dates";
import { paginate, parsePage } from "@/lib/pagination";
import { effectiveStatus, getContracts, getInvoices } from "@/lib/data/finance";
import { formatBRL, formatCompetencia, formatDate, statusBoletoLabel } from "@/lib/format";
import { getSantanderMode } from "@/lib/santander/client";
export const metadata = { title: "Financeiro" };
const tone = { pago: "success", pendente: "warning", vencido: "danger", cancelado: "neutral" };
const MODE_LABEL = { mock: "Simulado", sandbox: "Sandbox", production: "Produção" };
const columns = [
    {
        header: "Inquilino",
        hideOnCard: true,
        cell: (i) => (<div>
        <p className="font-medium">{i.inquilino}</p>
        <p className="text-xs text-muted">Nosso nº {i.nossoNumero}</p>
      </div>),
    },
    { header: "Competência", cell: (i) => formatCompetencia(i.competencia) },
    { header: "Vencimento", cell: (i) => formatDate(i.vencimento) },
    { header: "Valor", cell: (i) => <span className="tabular-nums">{formatBRL(i.valor, true)}</span> },
    {
        header: "Status",
        cell: (i) => (<div className="flex flex-col items-start gap-0.5">
        <Badge tone={tone[i.efetivo]}>{statusBoletoLabel[i.efetivo]}</Badge>
        {i.pagoEm && <span className="text-xs text-muted">em {formatDate(i.pagoEm)}</span>}
      </div>),
    },
    {
        header: "Ações",
        className: "text-right",
        cell: (i) => (i.efetivo === "pendente" || i.efetivo === "vencido" ? <MarkPaidButton id={i.id}/> : <span className="text-xs text-muted">—</span>),
    },
];
function nextCompetencia(today) {
    const [y, m] = today.split("-").map(Number);
    return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}
export default async function FinanceiroPage({ searchParams }) {
    const [query, today, invoices, contracts] = await Promise.all([searchParams, getToday(), getInvoices(), getContracts()]);
    const status = query.status;
    const mode = getSantanderMode();
    const rows = invoices.map((i) => ({
        ...i,
        efetivo: effectiveStatus(i, today),
        inquilino: contracts.find((c) => c.id === i.contratoId)?.inquilinoNome ?? i.inquilinoId,
    }));
    const sum = (list) => list.reduce((acc, i) => acc + i.valor, 0);
    const pendentes = rows.filter((r) => r.efetivo === "pendente");
    const vencidos = rows.filter((r) => r.efetivo === "vencido");
    const pagosMes = rows.filter((r) => r.status === "pago" && r.pagoEm?.slice(0, 7) === today.slice(0, 7));
    const active = status === "pendente" || status === "vencido" || status === "pago" ? status : "todos";
    const visible = active === "todos" ? rows : rows.filter((r) => r.efetivo === active);
    const paged = paginate(visible, parsePage(query.pagina));
    return (<>
      <PageHeader eyebrow="Financeiro" title="Boletos e Pix" description="Emissão de cobranças, acompanhamento de pagamentos e conciliação bancária." action={<div className="flex flex-wrap items-center gap-3">
            <Badge tone={mode === "production" ? "success" : "sand"}>
              <Plug className="size-3" aria-hidden/>
              Santander: {MODE_LABEL[mode]}
            </Badge>
            <ReconcileButton />
          </div>}/>

      <section aria-label="Resumo financeiro" className="grid gap-4 sm:grid-cols-3">
        <StatCard label="A receber" value={formatBRL(sum(pendentes))} icon={Clock} detail={`${pendentes.length} boleto(s) no prazo`}/>
        <StatCard label="Vencidos" value={formatBRL(sum(vencidos))} icon={AlertTriangle} tone={vencidos.length ? "danger" : "success"} detail={`${vencidos.length} boleto(s) em atraso`}/>
        <StatCard label="Recebido no mês" value={formatBRL(sum(pagosMes))} icon={CircleDollarSign} tone="success" detail={`${pagosMes.length} pagamento(s) conciliado(s)`}/>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="mb-4">
            <FilterTabs label="Filtrar boletos por status" active={active} tabs={[
            { value: "todos", label: "Todos", href: "/admin/financeiro", count: rows.length },
            { value: "pendente", label: "Pendentes", href: "/admin/financeiro?status=pendente", count: pendentes.length },
            { value: "vencido", label: "Vencidos", href: "/admin/financeiro?status=vencido", count: vencidos.length },
            { value: "pago", label: "Pagos", href: "/admin/financeiro?status=pago", count: rows.filter((r) => r.efetivo === "pago").length },
        ]}/>
          </div>
          <Card>
            <DataTable rows={paged.items} columns={columns} rowKey={(i) => i.id} caption="Boletos emitidos" cardTitle={(i) => (<div>
                  <p className="font-medium">{i.inquilino}</p>
                  <p className="text-xs text-muted">Nosso nº {i.nossoNumero}</p>
                </div>)} empty={<EmptyState icon={Receipt} title="Nenhum boleto neste filtro"/>}/>
            <Pagination pagination={paged} basePath="/admin/financeiro" query={query} itemLabel="boletos"/>
          </Card>
        </div>

        <Card className="self-start">
          <CardHeader title="Emitir cobrança" description="Boleto híbrido com Pix copia e cola"/>
          <IssueInvoiceForm competencia={nextCompetencia(today)} contracts={contracts.map((c) => ({
            id: c.id,
            label: `${c.inquilinoNome} — ${c.id}`,
            valor: c.valorAluguel,
            diaVencimento: c.diaVencimento,
        }))}/>
        </Card>
      </div>
    </>);
}
