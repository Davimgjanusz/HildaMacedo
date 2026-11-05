import { VisitForm } from "@/components/dashboard/visit-form";
import { VisitList } from "@/components/dashboard/visit-list";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth/dal";
import { getToday } from "@/lib/dates";
import { getVisits } from "@/lib/data/portal";
import { getProperties } from "@/lib/data/properties";
import { formatPrice } from "@/lib/format";
import { paginate, parsePage } from "@/lib/pagination";
export const metadata = { title: "Visitas" };
function addDays(iso, days) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
export default async function VisitasPage({ searchParams }) {
    const user = await requireRole("client");
    const [query, today, visits, properties] = await Promise.all([searchParams, getToday(), getVisits(user.id), getProperties()]);
    const imovel = query.imovel;
    const disponiveis = properties.filter((p) => p.status === "disponivel");
    const initialId = typeof imovel === "string" && disponiveis.some((p) => p.id === imovel) ? imovel : undefined;
    const proximas = visits.filter((v) => v.status === "agendada" && v.data >= today);
    const paged = paginate(proximas, parsePage(query.pagina));
    return (<>
      <PageHeader eyebrow="Agenda" title="Visitas" description="Agende online e receba a confirmação por e-mail."/>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Card className="self-start">
          <CardHeader title="Agendar visita"/>
          <VisitForm minDate={addDays(today, 1)} initialId={initialId} properties={disponiveis.map((p) => ({ id: p.id, label: `${p.titulo} — ${p.bairro} (${formatPrice(p.preco, p.finalidade)})` }))}/>
        </Card>
        <Card className="self-start">
          <CardHeader title="Próximas visitas"/>
          <VisitList visits={paged.items} properties={properties} cancelable/>
          <Pagination pagination={paged} basePath="/portal/client/visitas" query={query} itemLabel="visitas"/>
        </Card>
      </div>
    </>);
}
