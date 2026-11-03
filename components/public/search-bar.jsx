import Form from "next/form";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
const PRECOS = {
    venda: [
        { value: "2000000", label: "Até R$ 2 mi" },
        { value: "5000000", label: "Até R$ 5 mi" },
        { value: "10000000", label: "Até R$ 10 mi" },
    ],
    locacao: [
        { value: "10000", label: "Até R$ 10 mil/mês" },
        { value: "20000", label: "Até R$ 20 mil/mês" },
        { value: "50000", label: "Até R$ 50 mil/mês" },
    ],
};
const fieldLabel = "text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted";
const fieldControl = "w-full bg-transparent py-1 text-sm text-charcoal focus:outline-none";
/**
 * Busca rápida flutuante. Usa `next/form` (GET para /imoveis), então funciona
 * mesmo sem JavaScript. Em telas verticais os campos são empilhados.
 */
export function SearchBar({ className, defaults = {} }) {
    return (<Form action="/imoveis" role="search" aria-label="Buscar imóveis" className={cn("grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-line shadow-2xl shadow-black/10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_1fr_auto] lg:rounded-full", className)}>
      <label className="flex flex-col gap-0.5 bg-surface px-6 py-3.5">
        <span className={fieldLabel}>Finalidade</span>
        <select name="finalidade" defaultValue={defaults.finalidade ?? "venda"} className={cn(fieldControl, "cursor-pointer")}>
          <option value="venda">Comprar</option>
          <option value="locacao">Alugar</option>
        </select>
      </label>

      <label className="flex flex-col gap-0.5 bg-surface px-6 py-3.5">
        <span className={fieldLabel}>Tipo</span>
        <select name="tipo" defaultValue={defaults.tipo ?? ""} className={cn(fieldControl, "cursor-pointer")}>
          <option value="">Todos</option>
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
          <option value="cobertura">Cobertura</option>
          <option value="comercial">Comercial</option>
        </select>
      </label>

      <label className="flex flex-col gap-0.5 bg-surface px-6 py-3.5">
        <span className={fieldLabel}>Localização</span>
        <input name="q" defaultValue={defaults.q} placeholder="Bairro ou cidade" className={cn(fieldControl, "placeholder:text-muted/60")}/>
      </label>

      <label className="flex flex-col gap-0.5 bg-surface px-6 py-3.5">
        <span className={fieldLabel}>Valor máximo</span>
        <select name="precoMax" defaultValue={defaults.precoMax?.toString() ?? ""} className={cn(fieldControl, "cursor-pointer")}>
          <option value="">Sem limite</option>
          <optgroup label="Compra">
            {PRECOS.venda.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
          </optgroup>
          <optgroup label="Locação">
            {PRECOS.locacao.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
          </optgroup>
        </select>
      </label>

      <div className="flex items-center bg-surface p-2.5 sm:col-span-2 lg:col-span-1">
        <Button type="submit" size="lg" className="w-full lg:w-auto">
          <Search className="size-4" aria-hidden/>
          Buscar
        </Button>
      </div>
    </Form>);
}
