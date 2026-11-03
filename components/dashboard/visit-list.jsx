import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { CancelVisitButton } from "./visit-form";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { formatDate, statusVisitaLabel } from "@/lib/format";
const tone = { agendada: "sand", realizada: "success", cancelada: "neutral" };
export function VisitList({ visits, properties, cancelable = false }) {
    if (visits.length === 0) {
        return <EmptyState icon={CalendarDays} title="Nenhuma visita" description="Agende uma visita para conhecer um imóvel pessoalmente."/>;
    }
    return (<ul className="divide-y divide-line">
      {visits.map((v) => {
            const p = properties.find((x) => x.id === v.imovelId);
            return (<li key={v.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
            {p && (<div className="relative hidden size-14 shrink-0 overflow-hidden rounded-lg bg-line sm:block">
                <Image src={p.imagens[0]} alt="" fill sizes="56px" className="object-cover"/>
              </div>)}
            <div className="min-w-0 flex-1">
              <Link href={`/imovel/${v.imovelId}`} className="block truncate font-medium hover:underline">
                {p?.titulo ?? v.imovelId}
              </Link>
              <p className="text-sm text-muted">
                {formatDate(v.data)} às {v.horario}
                {v.observacoes ? ` · ${v.observacoes}` : ""}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
              <Badge tone={tone[v.status]}>{statusVisitaLabel[v.status]}</Badge>
              {cancelable && v.status === "agendada" && <CancelVisitButton id={v.id}/>}
            </div>
          </li>);
        })}
    </ul>);
}
