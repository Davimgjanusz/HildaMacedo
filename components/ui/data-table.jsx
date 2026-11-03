import { cn } from "@/lib/cn";
/**
 * Tabela responsiva: em telas ≥ md exibe uma tabela com scroll horizontal fluido;
 * abaixo disso, cada linha vira um cartão empilhado.
 */
export function DataTable({ rows, columns, rowKey, caption, cardTitle, empty }) {
    if (rows.length === 0 && empty)
        return <>{empty}</>;
    return (<>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
              {columns.map((col) => (<th key={col.header} scope="col" className={cn("px-5 py-3 font-medium", col.className)}>
                  {col.header}
                </th>))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (<tr key={rowKey(row)} className="transition-colors hover:bg-offwhite/70">
                {columns.map((col) => (<td key={col.header} className={cn("px-5 py-3.5 align-middle", col.className)}>
                    {col.cell(row)}
                  </td>))}
              </tr>))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden" aria-label={caption}>
        {rows.map((row) => (<li key={rowKey(row)} className="flex flex-col gap-3 px-4 py-4">
            {cardTitle && <div>{cardTitle(row)}</div>}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {columns
                .filter((col) => !col.hideOnCard)
                .map((col) => (<div key={col.header} className="min-w-0">
                    <dt className="text-xs text-muted">{col.header}</dt>
                    <dd className="mt-0.5 break-words">{col.cell(row)}</dd>
                  </div>))}
            </dl>
          </li>))}
      </ul>
    </>);
}
