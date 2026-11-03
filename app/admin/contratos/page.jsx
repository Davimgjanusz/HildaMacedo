import Link from "next/link";
import { FileSignature, Wrench } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui/primitives";
import { getToday } from "@/lib/dates";
import { getContracts } from "@/lib/data/finance";
import { getTickets } from "@/lib/data/portal";
import { getProperties } from "@/lib/data/properties";
import { categoriaChamadoLabel, daysBetween, formatBRL, formatDate, prioridadeLabel, statusChamadoLabel, } from "@/lib/format";
export const metadata = { title: "Contratos" };
function vigenciaBadge(dias) {
    if (dias < 0)
        return <Badge tone="neutral">Encerrado</Badge>;
    if (dias <= 60)
        return <Badge tone="warning">Vence em {dias} dias</Badge>;
    return <Badge tone="success">Vigente</Badge>;
}
function seguroBadge(dias) {
    if (dias < 0)
        return <Badge tone="danger">Vencido há {-dias} dias</Badge>;
    if (dias <= 30)
        return <Badge tone="warning">Vence em {dias} dias</Badge>;
    return <Badge tone="success">Em dia</Badge>;
}
const columns = [
    {
        header: "Contrato",
        hideOnCard: true,
        cell: (c) => (<div>
        <p className="font-medium">{c.inquilinoNome}</p>
        <p className="text-xs text-muted">{c.id} · {c.imovel}</p>
      </div>),
    },
    { header: "Vigência", cell: (c) => <span className="whitespace-nowrap">{formatDate(c.inicio)} – {formatDate(c.fim)}</span> },
    { header: "Situação", cell: (c) => vigenciaBadge(c.diasFim) },
    { header: "Aluguel", cell: (c) => <span className="tabular-nums">{formatBRL(c.valorAluguel)}</span> },
    { header: "Reajuste", cell: (c) => `${c.indice} · aniversário ${formatDate(c.inicio).slice(0, 5)}` },
    {
        header: "Seguro",
        cell: (c) => (<div className="flex flex-col items-start gap-1">
        <span className="text-xs text-muted">
          {c.seguro.tipo === "fianca" ? "Fiança" : "Incêndio"} · {c.seguro.seguradora}
        </span>
        {seguroBadge(c.diasSeguro)}
      </div>),
    },
];
const ticketTone = { aberto: "danger", em_andamento: "warning", concluido: "success" };
const ticketColumns = [
    {
        header: "Chamado",
        hideOnCard: true,
        cell: (t) => (<div>
        <p className="font-medium">{t.titulo}</p>
        <p className="text-xs text-muted">{t.id} · {categoriaChamadoLabel[t.categoria]}</p>
      </div>),
    },
    { header: "Aberto em", cell: (t) => formatDate(t.criadoEm) },
    { header: "Prioridade", cell: (t) => <Badge tone={t.prioridade === "alta" ? "danger" : "neutral"}>{prioridadeLabel[t.prioridade]}</Badge> },
    { header: "Status", cell: (t) => <Badge tone={ticketTone[t.status]}>{statusChamadoLabel[t.status]}</Badge> },
];
export default async function ContratosPage({ searchParams }) {
    const [{ filtro }, today, contracts, properties, tickets] = await Promise.all([
        searchParams,
        getToday(),
        getContracts(),
        getProperties(),
        getTickets(),
    ]);
    const rows = contracts.map((c) => ({
        ...c,
        imovel: properties.find((p) => p.id === c.imovelId)?.titulo ?? c.imovelId,
        diasFim: daysBetween(today, c.fim),
        diasSeguro: daysBetween(today, c.seguro.vencimento),
    }));
    const vencendo = rows.filter((r) => r.diasFim >= 0 && r.diasFim <= 60);
    const seguro = rows.filter((r) => r.diasSeguro <= 30);
    const active = filtro === "vencendo" || filtro === "seguro" ? filtro : "todos";
    const visible = active === "vencendo" ? vencendo : active === "seguro" ? seguro : rows;
    return (<>
      <PageHeader eyebrow="Locações" title="Contratos" description="Controle de vigência, reajustes e seguros."/>

      <div className="mb-4">
        <FilterTabs label="Filtrar contratos" active={active} tabs={[
            { value: "todos", label: "Todos", href: "/admin/contratos", count: rows.length },
            { value: "vencendo", label: "Vencendo em 60 dias", href: "/admin/contratos?filtro=vencendo", count: vencendo.length },
            { value: "seguro", label: "Seguro a renovar", href: "/admin/contratos?filtro=seguro", count: seguro.length },
        ]}/>
      </div>

      <Card>
        <DataTable rows={visible} columns={columns} rowKey={(r) => r.id} caption="Contratos de locação" cardTitle={(c) => (<div>
              <p className="font-medium">{c.inquilinoNome}</p>
              <p className="text-xs text-muted">{c.id} · {c.imovel}</p>
            </div>)} empty={<EmptyState icon={FileSignature} title="Nenhum contrato neste filtro"/>}/>
      </Card>

      <Card id="chamados" className="mt-8 scroll-mt-24">
        <CardHeader title="Chamados de manutenção" description="Abertos pelos inquilinos no portal"/>
        <DataTable rows={tickets} columns={ticketColumns} rowKey={(t) => t.id} caption="Chamados de manutenção" cardTitle={(t) => (<div>
              <p className="font-medium">{t.titulo}</p>
              <p className="text-xs text-muted">{t.id} · {categoriaChamadoLabel[t.categoria]}</p>
            </div>)} empty={<EmptyState icon={Wrench} title="Nenhum chamado"/>}/>
      </Card>

      <p className="mt-6 text-xs text-muted">
        Precisa falar com um inquilino? Use a <Link href="/admin/chat" className="underline">central de atendimento</Link>.
      </p>
    </>);
}
