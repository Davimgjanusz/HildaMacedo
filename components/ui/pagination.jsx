import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { buildPageHref, pageSequence } from "@/lib/pagination";

const control = "inline-grid h-9 min-w-9 place-items-center rounded-full px-2.5 text-sm ring-1 ring-inset transition-colors";
const enabled = "bg-surface text-charcoal ring-line hover:ring-sand";
const disabled = "bg-offwhite text-muted/50 ring-line";

/**
 * Navegação de páginas baseada em links (funciona sem JavaScript).
 * Não renderiza nada quando há apenas uma página.
 */
export function Pagination({ pagination, basePath, query, paramName = "pagina", hash, itemLabel = "registros" }) {
    const { page, totalPages, total, from, to } = pagination;
    if (totalPages <= 1) return null;

    const href = (p) => buildPageHref({ basePath, query, paramName, page: p, hash });
    const prev = page > 1;
    const next = page < totalPages;

    return (<nav aria-label="Paginação" className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-4 text-sm sm:flex-row sm:px-6">
      <p className="text-muted tabular-nums">
        Mostrando {from}–{to} de {total} {itemLabel}
      </p>

      <div className="flex items-center gap-1.5">
        {prev ? (<Link href={href(page - 1)} rel="prev" aria-label="Página anterior" className={cn(control, enabled)}>
            <ChevronLeft className="size-4" aria-hidden/>
          </Link>) : (<span aria-disabled="true" className={cn(control, disabled)}>
            <ChevronLeft className="size-4" aria-hidden/>
          </span>)}

        {pageSequence(page, totalPages).map((item, i) => item === "…" ? (<span key={`gap-${i}`} aria-hidden="true" className="px-1.5 text-muted">
              …
            </span>) : (<Link key={item} href={href(item)} aria-label={`Página ${item}`} aria-current={item === page ? "page" : undefined} className={cn(control, item === page ? "bg-charcoal text-white ring-charcoal" : enabled, "tabular-nums")}>
              {item}
            </Link>))}

        {next ? (<Link href={href(page + 1)} rel="next" aria-label="Próxima página" className={cn(control, enabled)}>
            <ChevronRight className="size-4" aria-hidden/>
          </Link>) : (<span aria-disabled="true" className={cn(control, disabled)}>
            <ChevronRight className="size-4" aria-hidden/>
          </span>)}
      </div>
    </nav>);
}
