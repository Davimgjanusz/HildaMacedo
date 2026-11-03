import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bath, BedDouble, CalendarDays, Car, Check, MapPin, MessageCircle, Ruler, Sparkles } from "lucide-react";
import { PropertyGallery } from "@/components/public/property-gallery";
import { FavoriteButton } from "@/components/public/favorite-button";
import { buttonClasses } from "@/components/ui/button";
import { Badge, Skeleton } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth/dal";
import { getFavoriteIds } from "@/lib/data/portal";
import { getProperties, getPropertyById } from "@/lib/data/properties";
import { finalidadeLabel, formatBRL, formatPrice, statusImovelLabel, tipoLabel } from "@/lib/format";
export async function generateStaticParams() {
    const properties = await getProperties();
    return properties.map((p) => ({ id: p.id }));
}
export async function generateMetadata({ params }) {
    const { id } = await params;
    const property = await getPropertyById(id);
    if (!property)
        return { title: "Imóvel não encontrado" };
    return {
        title: property.titulo,
        description: `${tipoLabel[property.tipo]} em ${property.bairro}, ${property.cidade} — ${formatPrice(property.preco, property.finalidade)}`,
        openGraph: { images: [property.imagens[0]] },
    };
}
export default async function ImovelPage({ params }) {
    const { id } = await params;
    const property = await getPropertyById(id);
    if (!property)
        notFound();
    const p = property;
    const specs = [
        { icon: Ruler, label: "Área útil", value: `${p.area} m²` },
        { icon: BedDouble, label: "Quartos", value: `${p.quartos} (${p.suites} suítes)` },
        { icon: Bath, label: "Banheiros", value: String(p.banheiros) },
        { icon: Car, label: "Vagas", value: String(p.vagas) },
    ].filter((s) => !(s.label === "Quartos" && p.quartos === 0));
    return (<div className="container-page pb-24 pt-28">
      <Link href="/imoveis" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-charcoal">
        <ArrowLeft className="size-4" aria-hidden/>
        Voltar para imóveis
      </Link>

      <PropertyGallery images={p.imagens} title={p.titulo}/>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        <article>
          <div className="flex flex-wrap gap-2">
            <Badge tone="dark">{finalidadeLabel[p.finalidade]}</Badge>
            <Badge tone="sand">{tipoLabel[p.tipo]}</Badge>
            {p.status !== "disponivel" && <Badge tone="warning">{statusImovelLabel[p.status]}</Badge>}
          </div>
          <h1 className="mt-4 text-3xl leading-tight sm:text-5xl">{p.titulo}</h1>
          <p className="mt-3 flex items-center gap-2 text-muted">
            <MapPin className="size-4 text-sand-dark" aria-hidden/>
            {p.bairro}, {p.cidade} — {p.uf}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-4">
            {specs.map(({ icon: Icon, label, value }) => (<div key={label} className="flex flex-col gap-1 bg-surface p-5">
                <Icon className="mb-1 size-5 text-sand-dark" aria-hidden/>
                <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
                <dd className="font-sans text-lg font-medium tabular-nums">{value}</dd>
              </div>))}
          </dl>

          <section className="mt-12" aria-labelledby="descricao">
            <h2 id="descricao" className="text-2xl">Sobre o imóvel</h2>
            <p className="mt-4 leading-relaxed text-muted">{p.descricao}</p>
          </section>

          {p.caracteristicas.length > 0 && (<section className="mt-12" aria-labelledby="caracteristicas">
              <h2 id="caracteristicas" className="flex items-center gap-2 text-2xl">
                <Sparkles className="size-5 text-sand-dark" aria-hidden/>
                Diferenciais
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {p.caracteristicas.map((c) => (<li key={c} className="flex items-center gap-3 text-sm">
                    <Check className="size-4 text-sand-dark" aria-hidden/>
                    {c}
                  </li>))}
              </ul>
            </section>)}

          {p.plantas.length > 0 && <FloorPlans property={p}/>}
        </article>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <p className="text-sm text-muted">{p.finalidade === "venda" ? "Valor de venda" : "Aluguel mensal"}</p>
            <p className="mt-1 font-sans text-4xl font-semibold tracking-tight tabular-nums">{formatBRL(p.preco)}</p>
            <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
              {p.condominio !== undefined && (<div className="flex justify-between">
                  <dt className="text-muted">Condomínio</dt>
                  <dd>{formatBRL(p.condominio)}/mês</dd>
                </div>)}
              {p.iptu !== undefined && (<div className="flex justify-between">
                  <dt className="text-muted">IPTU</dt>
                  <dd>{formatBRL(p.iptu)}/mês</dd>
                </div>)}
              {p.finalidade === "locacao" && (<div className="flex justify-between border-t border-line pt-2.5 font-medium">
                  <dt>Total estimado</dt>
                  <dd>{formatBRL(p.preco + (p.condominio ?? 0) + (p.iptu ?? 0))}/mês</dd>
                </div>)}
            </dl>

            <div className="mt-7 flex flex-col gap-3">
              {p.status === "disponivel" && (<Link href={`/portal/client/visitas?imovel=${p.id}`} className={buttonClasses("primary", "lg", "w-full")}>
                  <CalendarDays className="size-4" aria-hidden/>
                  Agendar visita
                </Link>)}
              <Link href="/#contato" className={buttonClasses("secondary", "lg", "w-full")}>
                <MessageCircle className="size-4" aria-hidden/>
                Falar com um consultor
              </Link>
              <Suspense fallback={<Skeleton className="h-11 rounded-full"/>}>
                <FavoriteSlot imovelId={p.id}/>
              </Suspense>
            </div>
          </div>
        </aside>
      </div>
    </div>);
}
function FloorPlans({ property }) {
    return (<section className="mt-12" aria-labelledby="plantas">
      <h2 id="plantas" className="text-2xl">Plantas</h2>
      <ul className="mt-5 grid gap-5 sm:grid-cols-2">
        {property.plantas.map((planta) => (<li key={planta.nome} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="relative aspect-[4/3] bg-offwhite">
              <Image src={planta.imagem} alt={`Planta — ${planta.nome}`} fill sizes="(min-width: 640px) 33vw, 100vw" unoptimized={planta.imagem.endsWith(".svg")} className={planta.imagem.endsWith(".svg") ? "object-contain p-4" : "object-cover"}/>
            </div>
            <div className="flex items-center justify-between px-5 py-4 text-sm">
              <span className="font-medium">{planta.nome}</span>
              <span className="text-muted">{planta.area} m²</span>
            </div>
          </li>))}
      </ul>
    </section>);
}
/** Lê a sessão — por isso fica atrás de um Suspense e não bloqueia o restante da página. */
async function FavoriteSlot({ imovelId }) {
    const user = await getCurrentUser();
    const favoritos = user?.role === "client" ? await getFavoriteIds(user.id) : [];
    return <FavoriteButton imovelId={imovelId} initial={favoritos.includes(imovelId)}/>;
}
