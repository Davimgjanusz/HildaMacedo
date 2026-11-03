import { ProtectedLayout } from "@/components/dashboard/protected-layout";
export const metadata = {
    title: { default: "Área do Cliente", template: "%s | Área do Cliente" },
    robots: { index: false, follow: false },
};
export default function ClientLayout({ children }) {
    return <ProtectedLayout area="client">{children}</ProtectedLayout>;
}
