import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/dashboard/property-form";
import { PageHeader } from "@/components/ui/primitives";
import { getPropertyById } from "@/lib/data/properties";
export const metadata = { title: "Editar imóvel" };
export default async function EditarImovelPage({ params }) {
    const { id } = await params;
    const property = await getPropertyById(id);
    if (!property)
        notFound();
    return (<>
      <PageHeader eyebrow="Portfólio" title="Editar imóvel" description={property.titulo}/>
      <PropertyForm property={property}/>
    </>);
}
