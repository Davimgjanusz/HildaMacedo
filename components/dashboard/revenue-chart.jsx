import { formatBRL, formatCompetencia } from "@/lib/format";
const SERIES = [
    { key: "recebido", label: "Recebido", color: "var(--color-chart-1)" },
    { key: "emAberto", label: "Em aberto", color: "var(--color-chart-2)" },
];
function niceMax(value) {
    if (value <= 0)
        return 1;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value / 4) * magnitude;
    return Math.ceil(value / step) * step;
}
const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
/**
 * Colunas empilhadas (recebido + em aberto) por competência.
 * Cada coluna tem tooltip no hover/foco e os mesmos dados ficam na tabela abaixo.
 */
export function RevenueChart({ data }) {
    const max = niceMax(Math.max(...data.map((d) => d.recebido + d.emAberto)));
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => max * t);
    return (<figure className="flex flex-col gap-4">
      <ul className="flex flex-wrap gap-4 text-xs text-muted" aria-label="Legenda">
        {SERIES.map((s) => (<li key={s.key} className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ background: s.color }} aria-hidden/>
            {s.label}
          </li>))}
      </ul>

      <div className="flex gap-3" aria-hidden>
        <div className="relative h-56 w-10 shrink-0 text-right text-[0.7rem] tabular-nums text-muted">
          {ticks.map((t) => (<span key={t} className="absolute right-0" style={{ bottom: `${(t / max) * 100}%`, transform: "translateY(50%)" }}>
              {compact.format(t)}
            </span>))}
        </div>
        <div className="relative h-56 flex-1">
          {ticks.map((t) => (<div key={t} className="absolute inset-x-0 border-t border-line" style={{ bottom: `${(t / max) * 100}%` }}/>))}
          <div className="absolute inset-0 flex items-end justify-around">
            {data.map((d) => {
            const total = d.recebido + d.emAberto;
            return (<div key={d.competencia} className="group relative flex h-full w-full items-end justify-center">
                  <div tabIndex={0} className="flex w-6 flex-col-reverse gap-[2px] outline-none" style={{ height: `${(total / max) * 100}%` }}>
                    {SERIES.map((s, i) => {
                    const value = d[s.key];
                    if (!value)
                        return null;
                    const isTop = i === SERIES.length - 1 || !d[SERIES[i + 1].key];
                    return (<div key={s.key} className={isTop ? "rounded-t-[4px]" : ""} style={{ background: s.color, flexGrow: value, flexBasis: 0, minHeight: 2 }}/>);
                })}
                  </div>
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-max -translate-x-1/2 rounded-lg bg-charcoal px-3 py-2 text-xs text-white shadow-lg group-focus-within:block group-hover:block">
                    <p className="mb-1 font-medium">{formatCompetencia(d.competencia)}</p>
                    {SERIES.map((s) => (<p key={s.key} className="flex items-center gap-2 tabular-nums">
                        <span className="size-2 rounded-sm" style={{ background: s.color }}/>
                        {s.label}: {formatBRL(d[s.key])}
                      </p>))}
                  </div>
                </div>);
        })}
          </div>
        </div>
      </div>
      <div className="ml-13 flex justify-around text-xs text-muted" aria-hidden>
        {data.map((d) => (<span key={d.competencia} className="w-full text-center">
            {formatCompetencia(d.competencia)}
          </span>))}
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-xs font-medium text-sand-dark">Ver dados em tabela</summary>
        <table className="mt-3 w-full text-left text-xs">
          <caption className="sr-only">Recebimentos por competência</caption>
          <thead>
            <tr className="text-muted">
              <th scope="col" className="py-1.5 font-medium">Competência</th>
              <th scope="col" className="py-1.5 text-right font-medium">Recebido</th>
              <th scope="col" className="py-1.5 text-right font-medium">Em aberto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line tabular-nums">
            {data.map((d) => (<tr key={d.competencia}>
                <th scope="row" className="py-1.5 font-normal">{formatCompetencia(d.competencia)}</th>
                <td className="py-1.5 text-right">{formatBRL(d.recebido)}</td>
                <td className="py-1.5 text-right">{formatBRL(d.emAberto)}</td>
              </tr>))}
          </tbody>
        </table>
      </details>
    </figure>);
}
