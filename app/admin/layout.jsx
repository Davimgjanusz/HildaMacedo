import { ProtectedLayout } from "@/components/dashboard/protected-layout";
export const metadata = {
    title: { default: "Administração", template: "%s | Admin · Hilda Macedo" },
    robots: { index: false, follow: false },
};
export default function AdminLayout({ children }) {
    return <ProtectedLayout area="admin">{children}</ProtectedLayout>;
}
