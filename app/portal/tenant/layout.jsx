import { ProtectedLayout } from "@/components/dashboard/protected-layout";
export const metadata = {
    title: { default: "Portal do Inquilino", template: "%s | Portal do Inquilino" },
    robots: { index: false, follow: false },
};
export default function TenantLayout({ children }) {
    return <ProtectedLayout area="tenant">{children}</ProtectedLayout>;
}
