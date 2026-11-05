import { Suspense } from "react";
import Form from "next/form";
import Link from "next/link";
import { SearchX, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { PropertyCard } from "@/components/public/property-card";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-controls";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, Skeleton } from "@/components/ui/primitives";
import { searchProperties } from "@/lib/data/properties";
import { cn } from "@/lib/cn";
import { paginate, parsePage } from "@/lib/pagination";

// Número de imóveis por página na vitrine (múltiplo de 3 para formar linhas completas).
const PUBLIC_PAGE_SIZE = 9;
export const metadata = {
    title: "Imóveis à venda e para locação",
    description: "Apartamentos, casas e coberturas de alto padrão para comprar ou alugar.",
};
// Parâmetros inválidos na URL são simplesmente ignorados.
const filtersSchema = z.object({
    finalidade: z.enum(["venda", "locacao"]).optional().catch(undefined),
    tipo: z.enum(["apartamento", "casa", "cobertura", "comercial", "terreno"]).optional().catch(undefined),
    q: z.string().trim().max(60).optional().catch(undefined),
    precoMax: z.coerce.number().positive().optional().catch(undefined),
    quartos: z.coerce.number().int().min(1).max(5).optional().catch(undefined),
    ordem: z.enum(["recentes", "menor-preco", "maior-preco"]).optional().catch(undefined),
});
function parseFilters(raw) {
    const single = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v || undefined]));
    return filtersSchema.parse(single);
}
export default function ImoveisPage({ searchParams }) {
    return (<div className="container-page pb-24 pt-32">
      <header className="mb-10">
        <p className="eyebrow mb-3">Portfólio</p>
        <h1 className="text-4xl sm:text-5xl">Imóveis</h1>
      </header>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams}/>
      </Suspense>
    </div>);
}
async function Results({ searchParams }) {
    const query = await searchParams;
    const filters = parseFilters(query);
    const all = await searchProperties(filters);
    const paged = paginate(all, parsePage(query.pagina), PUBLIC_PAGE_SIZE);
    const properties = paged.items;
    return (<div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
      <aside>
        <details className="group rounded-2xl border border-line bg-surface lg:open:border-line" open>
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-medium lg:pointer-events-none">
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-sand-dark" aria-hidden/>
              Filtros
            </span>
            <span className="text-xs text-muted lg:hidden">toque para expandir/recolher</span>
          </summary>
          <FiltersForm filters={filters}/>
        </details>
      </aside>

      <section aria-live="polite" aria-label="Resultados da busca">
        <p className="mb-6 text-sm text-muted">
          {all.length} {all.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
        </p>
        {all.length === 0 ? (<div className="rounded-2xl border border-line bg-surface">
            <EmptyState icon={SearchX} title="Nenhum imóvel encontrado" description="Ajuste os filtros ou fale com nossa equipe — temos opções fora do portfólio público." action={<Link href="/imoveis" className={buttonClasses("outline", "sm")}>
                  Limpar filtros
                </Link>}/>
          </div>) : (<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((p) => (<PropertyCard key={p.id} property={p}/>))}
          </div>)}
        <div className="mt-10">
          <Pagination pagination={paged} basePath="/imoveis" query={query} itemLabel="imóveis"/>
        </div>
      </section>
    </div>);
}
function FiltersForm({ filters }) {
    const radio = "flex-1 cursor-pointer rounded-full border border-line py-2 text-center text-sm transition-colors has-[:checked]:border-charcoal has-[:checked]:bg-charcoal has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sand";
    return (<Form action="/imoveis" className="flex flex-col gap-5 border-t border-line px-5 py-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Finalidade</legend>
        <div className="flex gap-2">
          {[
            { value: "", label: "Todos" },
            { value: "venda", label: "Comprar" },
            { value: "locacao", label: "Alugar" },
        ].map((opt) => (<label key={opt.value} className={radio}>
              <input type="radio" name="finalidade" value={opt.value} defaultChecked={(filters.finalidade ?? "") === opt.value} className="sr-only"/>
              {opt.label}
            </label>))}
        </div>
      </fieldset>

      <FilterField label="Localização" id="f-q">
        <Input id="f-q" name="q" defaultValue={filters.q} placeholder="Bairro ou cidade"/>
      </FilterField>

      <FilterField label="Tipo de imóvel" id="f-tipo">
        <Select id="f-tipo" name="tipo" defaultValue={filters.tipo ?? ""}>
          <option value="">Todos</option>
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
          <option value="cobertura">Cobertura</option>
          <option value="comercial">Comercial</option>
        </Select>
      </FilterField>

      <FilterField label="Valor máximo (R$)" id="f-preco">
        <Input id="f-preco" name="precoMax" type="number" min={0} step={1000} inputMode="numeric" defaultValue={filters.precoMax} placeholder="Sem limite"/>
      </FilterField>

      <FilterField label="Quartos" id="f-quartos">
        <Select id="f-quartos" name="quartos" defaultValue={filters.quartos?.toString() ?? ""}>
          <option value="">Qualquer</option>
          {[1, 2, 3, 4].map((n) => (<option key={n} value={n}>
              {n}+ quartos
            </option>))}
        </Select>
      </FilterField>

      <FilterField label="Ordenar por" id="f-ordem">
        <Select id="f-ordem" name="ordem" defaultValue={filters.ordem ?? "recentes"}>
          <option value="recentes">Mais recentes</option>
          <option value="menor-preco">Menor preço</option>
          <option value="maior-preco">Maior preço</option>
        </Select>
      </FilterField>

      <div className="flex gap-2 pt-1">
        <Button type="submit" className="flex-1">Aplicar</Button>
        <Link href="/imoveis" className={buttonClasses("ghost", "md")}>Limpar</Link>
      </div>
    </Form>);
}
function FilterField({ label, id, children }) {
    return (<div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
    </div>);
}
function ResultsSkeleton() {
    return (<div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
      <Skeleton className="h-14 lg:h-[520px]"/>
      <div className={cn("grid gap-6 sm:grid-cols-2 xl:grid-cols-3")}>
        {Array.from({ length: 6 }, (_, i) => (<Skeleton key={i} className="aspect-[3/4] rounded-2xl"/>))}
      </div>
    </div>);
}
