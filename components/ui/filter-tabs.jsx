import Link from "next/link";
import { cn } from "@/lib/cn";
/** Abas de filtro baseadas em URL (funcionam sem JavaScript e são compartilháveis). */
export function FilterTabs({ tabs, active, label }) {
    return (<nav aria-label={label} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2">
        {tabs.map((tab) => (<li key={tab.value}>
            <Link href={tab.href} aria-current={tab.value === active ? "page" : undefined} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ring-1 ring-inset transition-colors", tab.value === active ? "bg-charcoal text-white ring-charcoal" : "bg-surface text-charcoal/75 ring-line hover:ring-sand")}>
              {tab.label}
              {tab.count !== undefined && (<span className={cn("rounded-full px-1.5 text-xs tabular-nums", tab.value === active ? "bg-white/15" : "bg-offwhite")}>
                  {tab.count}
                </span>)}
            </Link>
          </li>))}
      </ul>
    </nav>);
}
