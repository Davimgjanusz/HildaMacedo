import { Building2, CalendarDays, FileSignature, Heart, LayoutDashboard, MessagesSquare, Receipt, Wallet, Wrench, } from "lucide-react";
export const NAV = {
    admin: {
        title: "Administração",
        items: [
            { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/imoveis", label: "Imóveis", icon: Building2 },
            { href: "/admin/contratos", label: "Contratos", icon: FileSignature },
            { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
            { href: "/admin/chat", label: "Atendimento", icon: MessagesSquare },
        ],
    },
    tenant: {
        title: "Portal do Inquilino",
        items: [
            { href: "/portal/tenant", label: "Visão geral", icon: LayoutDashboard, exact: true },
            { href: "/portal/tenant/boletos", label: "Boletos e Pix", icon: Receipt },
            { href: "/portal/tenant/chamados", label: "Chamados", icon: Wrench },
        ],
    },
    client: {
        title: "Área do Cliente",
        items: [
            { href: "/portal/client", label: "Favoritos e histórico", icon: Heart, exact: true },
            { href: "/portal/client/visitas", label: "Visitas", icon: CalendarDays },
            { href: "/imoveis", label: "Buscar imóveis", icon: Building2 },
        ],
    },
};
