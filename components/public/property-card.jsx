import Image from "next/image";
import Link from "next/link";
import { BedDouble, Car, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { finalidadeLabel, formatPrice, statusImovelLabel, tipoLabel } from "@/lib/format";
export function PropertyCard({ property, priority = false }) {
    const p = property;
    return (<article className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-line transition-shadow hover:shadow-xl hover:shadow-black/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={p.imagens[0]} alt={`Foto de ${p.titulo}`} fill priority={priority} sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105"/>
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge tone="dark">{finalidadeLabel[p.finalidade]}</Badge>
          {p.status === "reservado" && <Badge tone="sand" className="bg-white/90">{statusImovelLabel.reservado}</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-sand-dark">
          <MapPin className="size-3.5" aria-hidden/>
          {p.bairro}, {p.cidade}
        </p>
        <h3 className="font-serif text-xl leading-snug">
          <Link href={`/imovel/${p.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {p.titulo}
          </Link>
        </h3>
        <p className="text-sm text-muted">{tipoLabel[p.tipo]}</p>

        <ul className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm text-charcoal/80">
          <li className="flex items-center gap-1.5">
            <Ruler className="size-4 text-sand-dark" aria-hidden/>
            {p.area} m²
          </li>
          {p.quartos > 0 && (<li className="flex items-center gap-1.5">
              <BedDouble className="size-4 text-sand-dark" aria-hidden/>
              {p.quartos} {p.quartos === 1 ? "quarto" : "quartos"}
            </li>)}
          <li className="flex items-center gap-1.5">
            <Car className="size-4 text-sand-dark" aria-hidden/>
            {p.vagas} {p.vagas === 1 ? "vaga" : "vagas"}
          </li>
        </ul>
        <p className="font-sans text-2xl font-semibold tabular-nums">{formatPrice(p.preco, p.finalidade)}</p>
      </div>
    </article>);
}
