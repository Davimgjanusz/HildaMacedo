import { PropertyForm } from "@/components/dashboard/property-form";
import { PageHeader } from "@/components/ui/primitives";
export const metadata = { title: "Novo imóvel" };
export default function NovoImovelPage() {
    return (<>
      <PageHeader eyebrow="Portfólio" title="Novo imóvel" description="Os dados são validados antes de publicar o anúncio."/>
      <PropertyForm />
    </>);
}
