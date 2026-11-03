import Image from "next/image";
import Link from "next/link";
import { Building2, ExternalLink, Pencil, Plus } from "lucide-react";
import { DeletePropertyButton } from "@/components/dashboard/delete-property-button";
import { buttonClasses } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { getProperties } from "@/lib/data/properties";
import { finalidadeLabel, formatPrice, statusImovelLabel, tipoLabel } from "@/lib/format";
export const metadata = { title: "Imóveis" };
const statusTone = {
    disponivel: "success",
    reservado: "warning",
    vendido: "neutral",
    alugado: "sand",
};
function Thumb({ p }) {
    return (<div className="flex items-center gap-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-line">
        <Image src={p.imagens[0]} alt="" fill sizes="48px" className="object-cover"/>
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium">{p.titulo}</p>
        <p className="truncate text-xs text-muted">{p.bairro}, {p.cidade}</p>
      </div>
    </div>);
}
const columns = [
    { header: "Imóvel", cell: (p) => <Thumb p={p}/>, className: "max-w-xs", hideOnCard: true },
    { header: "Tipo", cell: (p) => tipoLabel[p.tipo] },
    { header: "Finalidade", cell: (p) => finalidadeLabel[p.finalidade] },
    { header: "Valor", cell: (p) => <span className="tabular-nums">{formatPrice(p.preco, p.finalidade)}</span> },
    { header: "Status", cell: (p) => <Badge tone={statusTone[p.status]}>{statusImovelLabel[p.status]}</Badge> },
    {
        header: "Ações",
        className: "text-right",
        cell: (p) => (<div className="flex items-center justify-end gap-1">
        <Link href={`/imovel/${p.id}`} className={buttonClasses("ghost", "icon")} aria-label={`Ver anúncio de ${p.titulo}`} target="_blank">
          <ExternalLink className="size-4"/>
        </Link>
        <Link href={`/admin/imoveis/${p.id}`} className={buttonClasses("ghost", "icon")} aria-label={`Editar ${p.titulo}`}>
          <Pencil className="size-4"/>
        </Link>
        <DeletePropertyButton id={p.id} titulo={p.titulo}/>
      </div>),
    },
];
export default async function AdminImoveisPage() {
    const properties = await getProperties();
    return (<>
      <PageHeader eyebrow="Portfólio" title="Imóveis" description={`${properties.length} imóveis cadastrados.`} action={<Link href="/admin/imoveis/novo" className={buttonClasses("primary", "md")}>
            <Plus className="size-4" aria-hidden/>
            Novo imóvel
          </Link>}/>
      <Card>
        <DataTable rows={properties} columns={columns} rowKey={(p) => p.id} caption="Imóveis cadastrados" cardTitle={(p) => <Thumb p={p}/>} empty={<EmptyState icon={Building2} title="Nenhum imóvel cadastrado"/>}/>
      </Card>
    </>);
}
