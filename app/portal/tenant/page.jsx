import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarClock, FileSignature, Receipt, ShieldCheck, Wrench } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth/dal";
import { getToday } from "@/lib/dates";
import { effectiveStatus, getContractsByTenant, getInvoices } from "@/lib/data/finance";
import { getTickets } from "@/lib/data/portal";
import { getProperties } from "@/lib/data/properties";
import { daysBetween, formatBRL, formatCompetencia, formatDate } from "@/lib/format";
export const metadata = { title: "Visão geral" };
export default async function TenantHome() {
    const user = await requireRole("tenant");
    const [today, contracts, invoices, tickets, properties] = await Promise.all([
        getToday(),
        getContractsByTenant(user.id),
        getInvoices({ inquilinoId: user.id }),
        getTickets({ inquilinoId: user.id }),
        getProperties(),
    ]);
    const contrato = contracts[0];
    const imovel = contrato ? properties.find((p) => p.id === contrato.imovelId) : undefined;
    const abertos = invoices
        .filter((i) => i.status === "pendente")
        .sort((a, b) => a.vencimento.localeCompare(b.vencimento));
    const proximo = abertos[0];
    const proximoStatus = proximo ? effectiveStatus(proximo, today) : null;
    const pagos = invoices.filter((i) => i.status === "pago").slice(0, 4);
    const chamadosAbertos = tickets.filter((t) => t.status !== "concluido").length;
    return (<>
      <PageHeader eyebrow="Portal do inquilino" title={`Olá, ${user.name.split(" ")[0]}`} description="Acompanhe seu contrato, pagamentos e solicitações."/>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col p-6 lg:col-span-1">
          <p className="flex items-center gap-2 text-sm text-muted">
            <Receipt className="size-4 text-sand-dark" aria-hidden/>
            Próximo pagamento
          </p>
          {proximo ? (<>
              <p className="mt-4 font-sans text-4xl font-semibold tracking-tight tabular-nums">{formatBRL(proximo.valor, true)}</p>
              <p className="mt-1 text-sm text-muted">
                Aluguel de {formatCompetencia(proximo.competencia)} · vence em {formatDate(proximo.vencimento)}
              </p>
              <div className="mt-3">
                {proximoStatus === "vencido" ? (<Badge tone="danger">Vencido há {daysBetween(proximo.vencimento, today)} dias</Badge>) : (<Badge tone="warning">Faltam {daysBetween(today, proximo.vencimento)} dias</Badge>)}
              </div>
              <Link href="/portal/tenant/boletos" className={buttonClasses("primary", "md", "mt-auto w-full")}>
                Pagar com boleto ou Pix
                <ArrowRight className="size-4" aria-hidden/>
              </Link>
            </>) : (<p className="mt-4 text-sm text-muted">Nenhum pagamento em aberto. Tudo em dia!</p>)}
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          {contrato && imovel ? (<div className="grid sm:grid-cols-[220px_1fr]">
              <div className="relative aspect-video sm:aspect-auto">
                <Image src={imovel.imagens[0]} alt={imovel.titulo} fill sizes="(min-width: 640px) 220px, 100vw" className="object-cover"/>
              </div>
              <div className="p-6">
                <p className="flex items-center gap-2 text-sm text-muted">
                  <FileSignature className="size-4 text-sand-dark" aria-hidden/>
                  Contrato {contrato.id}
                </p>
                <h2 className="mt-2 text-2xl">{imovel.titulo}</h2>
                <p className="text-sm text-muted">{imovel.bairro}, {imovel.cidade}</p>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">Vigência</dt>
                    <dd>até {formatDate(contrato.fim)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Aluguel</dt>
                    <dd className="tabular-nums">{formatBRL(contrato.valorAluguel)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Reajuste</dt>
                    <dd>{contrato.indice} · {formatDate(contrato.inicio).slice(0, 5)}</dd>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <dt className="text-xs text-muted">Seguro</dt>
                    <dd className="flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-success" aria-hidden/>
                      {contrato.seguro.tipo === "fianca" ? "Seguro fiança" : "Seguro incêndio"} · {contrato.seguro.seguradora} · válido até {formatDate(contrato.seguro.vencimento)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>) : (<EmptyState icon={FileSignature} title="Nenhum contrato ativo"/>)}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Últimos pagamentos" action={<Link href="/portal/tenant/boletos" className="text-sm text-sand-dark hover:underline">Ver todos</Link>}/>
          <ul className="divide-y divide-line">
            {pagos.map((i) => (<li key={i.id} className="flex items-center justify-between px-5 py-3.5 text-sm sm:px-6">
                <span>Aluguel {formatCompetencia(i.competencia)}</span>
                <span className="flex items-center gap-3">
                  <span className="tabular-nums">{formatBRL(i.valor)}</span>
                  <Badge tone="success">Pago</Badge>
                </span>
              </li>))}
          </ul>
        </Card>

        <Card className="flex flex-col p-6">
          <p className="flex items-center gap-2 text-sm text-muted">
            <Wrench className="size-4 text-sand-dark" aria-hidden/>
            Manutenção
          </p>
          <p className="mt-4 font-sans text-4xl font-semibold tracking-tight tabular-nums">{chamadosAbertos}</p>
          <p className="text-sm text-muted">{chamadosAbertos === 1 ? "chamado em andamento" : "chamados em andamento"}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/portal/tenant/chamados" className={buttonClasses("outline", "md")}>
              <CalendarClock className="size-4" aria-hidden/>
              Acompanhar ou abrir chamado
            </Link>
          </div>
        </Card>
      </div>
    </>);
}
