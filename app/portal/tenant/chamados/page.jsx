import { Wrench } from "lucide-react";
import { TicketForm } from "@/components/dashboard/ticket-form";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth/dal";
import { getTickets } from "@/lib/data/portal";
import { categoriaChamadoLabel, formatDate, prioridadeLabel, statusChamadoLabel } from "@/lib/format";
export const metadata = { title: "Chamados" };
const tone = { aberto: "danger", em_andamento: "warning", concluido: "success" };
export default async function ChamadosPage() {
    const user = await requireRole("tenant");
    const tickets = await getTickets({ inquilinoId: user.id });
    return (<>
      <PageHeader eyebrow="Suporte" title="Chamados de manutenção" description="Abra uma solicitação e acompanhe o atendimento."/>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Card className="self-start">
          <CardHeader title="Novo chamado" description="Nossa equipe responde em até 24 horas úteis."/>
          <TicketForm />
        </Card>

        <Card className="self-start">
          <CardHeader title="Meus chamados"/>
          {tickets.length === 0 ? (<EmptyState icon={Wrench} title="Nenhum chamado aberto"/>) : (<ul className="divide-y divide-line">
              {tickets.map((t) => (<li key={t.id} className="flex flex-col gap-2 px-5 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{t.titulo}</p>
                    <Badge tone={tone[t.status]}>{statusChamadoLabel[t.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted">{t.descricao}</p>
                  <p className="text-xs text-muted">
                    {t.id} · {categoriaChamadoLabel[t.categoria]} · prioridade {prioridadeLabel[t.prioridade].toLowerCase()} · aberto em {formatDate(t.criadoEm)}
                  </p>
                </li>))}
            </ul>)}
        </Card>
      </div>
    </>);
}
