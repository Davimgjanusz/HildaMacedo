import Link from "next/link";
import { AlertTriangle, ArrowRight, Building2, CircleDollarSign, FileWarning, Home, ShieldAlert, TrendingDown, Wrench } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Badge, Card, CardHeader, PageHeader, StatCard } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth/dal";
import { getToday } from "@/lib/dates";
import { getContracts, getDashboardMetrics } from "@/lib/data/finance";
import { getLeads, getTickets } from "@/lib/data/portal";
import { daysBetween, formatBRL, formatCompactBRL, formatDate, finalidadeLabel } from "@/lib/format";
export const metadata = { title: "Dashboard" };
const pct = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });
export default async function AdminDashboard() {
    const [user, today] = await Promise.all([getCurrentUser(), getToday()]);
    const [m, contracts, tickets, leads] = await Promise.all([getDashboardMetrics(today), getContracts(), getTickets(), getLeads()]);
    const vencendo = contracts.filter((c) => {
        const dias = daysBetween(today, c.fim);
        return dias >= 0 && dias <= 60;
    });
    const seguros = contracts.filter((c) => daysBetween(today, c.seguro.vencimento) <= 30);
    const chamadosAbertos = tickets.filter((t) => t.status !== "concluido");
    const alertas = [
        ...vencendo.map((c) => ({
            icon: FileWarning,
            tone: "warning",
            texto: `Contrato ${c.id} (${c.inquilinoNome}) vence em ${daysBetween(today, c.fim)} dias`,
            href: "/admin/contratos?filtro=vencendo",
        })),
        ...seguros.map((c) => {
            const dias = daysBetween(today, c.seguro.vencimento);
            return {
                icon: ShieldAlert,
                tone: dias < 0 ? "danger" : "warning",
                texto: dias < 0 ? `Seguro do contrato ${c.id} vencido há ${-dias} dias` : `Seguro do contrato ${c.id} vence em ${dias} dias`,
                href: "/admin/contratos?filtro=seguro",
            };
        }),
        ...(m.boletosVencidos
            ? [{ icon: AlertTriangle, tone: "danger", texto: `${m.boletosVencidos} boleto(s) vencido(s) — ${formatBRL(m.valorVencido)}`, href: "/admin/financeiro?status=vencido" }]
            : []),
        ...(chamadosAbertos.length
            ? [{ icon: Wrench, tone: "neutral", texto: `${chamadosAbertos.length} chamado(s) de manutenção em aberto`, href: "/admin/contratos#chamados" }]
            : []),
    ];
    return (<>
      <PageHeader eyebrow="Visão geral" title={`Olá, ${user?.name.split(" ")[0] ?? ""}`} description={`Indicadores atualizados em ${formatDate(today)}.`}/>

      <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="VGV em carteira" value={formatCompactBRL(m.vgv)} icon={Building2} detail={`${m.imoveisVenda} imóveis à venda`}/>
        <StatCard label="Taxa de ocupação" value={pct.format(m.ocupacao)} icon={Home} tone={m.ocupacao >= 0.8 ? "success" : "neutral"} detail={`${m.alugados} de ${m.totalLocacao} imóveis de locação alugados`}/>
        <StatCard label="Inadimplência" value={pct.format(m.inadimplencia)} icon={TrendingDown} tone={m.inadimplencia > 0.05 ? "danger" : "success"} detail={`${formatBRL(m.valorVencido)} vencidos em aberto`}/>
        <StatCard label="Receita do mês" value={formatCompactBRL(m.receitaMes)} icon={CircleDollarSign} detail={`de ${formatBRL(m.previstoMes)} previstos`}/>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Recebimentos de aluguel" description="Últimas seis competências"/>
          <div className="p-5 sm:p-6">
            <RevenueChart data={m.recebimentos}/>
          </div>
        </Card>

        <Card>
          <CardHeader title="Alertas" description="Itens que pedem atenção"/>
          {alertas.length === 0 ? (<p className="p-6 text-sm text-muted">Nenhum alerta no momento.</p>) : (<ul className="divide-y divide-line">
              {alertas.map((a) => (<li key={a.texto}>
                  <Link href={a.href} className="flex items-start gap-3 px-5 py-4 text-sm hover:bg-offwhite sm:px-6">
                    <Badge tone={a.tone} className="mt-0.5 !p-1">
                      <a.icon className="size-3.5" aria-hidden/>
                    </Badge>
                    <span className="flex-1">{a.texto}</span>
                    <ArrowRight className="mt-0.5 size-4 text-muted" aria-hidden/>
                  </Link>
                </li>))}
            </ul>)}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Leads recentes" description="Contatos recebidos pelo site"/>
        <ul className="divide-y divide-line">
          {leads.slice(0, 5).map((lead) => (<li key={lead.id} className="flex flex-col gap-1 px-5 py-4 text-sm sm:flex-row sm:items-center sm:gap-6 sm:px-6">
              <div className="min-w-0 sm:w-56">
                <p className="font-medium">{lead.nome}</p>
                <a href={`mailto:${lead.email}`} className="truncate text-xs text-muted hover:underline">{lead.email}</a>
              </div>
              <p className="flex-1 text-muted">{lead.mensagem}</p>
              <div className="flex items-center gap-3">
                <Badge tone="sand">{lead.interesse === "administracao" ? "Administração" : finalidadeLabel[lead.interesse]}</Badge>
                <span className="text-xs text-muted">{formatDate(lead.criadoEm)}</span>
              </div>
            </li>))}
        </ul>
      </Card>
    </>);
}
