import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { PropertyCard } from "@/components/public/property-card";
import { VisitList } from "@/components/dashboard/visit-list";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth/dal";
import { getFavoriteIds, getVisits } from "@/lib/data/portal";
import { getProperties } from "@/lib/data/properties";
export const metadata = { title: "Favoritos e histórico" };
export default async function ClientHome() {
    const user = await requireRole("client");
    const [favoriteIds, visits, properties] = await Promise.all([getFavoriteIds(user.id), getVisits(user.id), getProperties()]);
    const favoritos = properties.filter((p) => favoriteIds.includes(p.id));
    return (<>
      <PageHeader eyebrow="Área do cliente" title={`Olá, ${user.name.split(" ")[0]}`} description="Seus imóveis favoritos e o histórico de visitas." action={<Link href="/imoveis" className={buttonClasses("outline", "md")}>
            <Search className="size-4" aria-hidden/>
            Buscar imóveis
          </Link>}/>

      <section aria-labelledby="favoritos">
        <h2 id="favoritos" className="mb-4 flex items-center gap-2 text-2xl">
          <Heart className="size-5 text-sand-dark" aria-hidden/>
          Favoritos
        </h2>
        {favoritos.length === 0 ? (<Card>
            <EmptyState icon={Heart} title="Nenhum favorito ainda" description="Toque em “Salvar nos favoritos” na página de um imóvel para acompanhá-lo aqui."/>
          </Card>) : (<div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
            {favoritos.map((p) => (<PropertyCard key={p.id} property={p}/>))}
          </div>)}
      </section>

      <Card className="mt-10">
        <CardHeader title="Histórico de visitas" action={<Link href="/portal/client/visitas" className="text-sm text-sand-dark hover:underline">Agendar nova</Link>}/>
        <VisitList visits={visits} properties={properties}/>
      </Card>
    </>);
}
