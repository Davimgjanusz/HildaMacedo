/** Área inicial de cada perfil e o prefixo de rota que ele pode acessar. */
export const ROLE_HOME = {
    admin: "/admin/dashboard",
    tenant: "/portal/tenant",
    client: "/portal/client",
};
const ROLE_PREFIX = {
    admin: "/admin",
    tenant: "/portal/tenant",
    client: "/portal/client",
};
export function requiredRoleFor(pathname) {
    for (const [role, prefix] of Object.entries(ROLE_PREFIX)) {
        if (pathname === prefix || pathname.startsWith(`${prefix}/`))
            return role;
    }
    return pathname.startsWith("/portal") ? "client" : null;
}
/** Aceita apenas caminhos internos que o perfil pode abrir (evita open redirect). */
export function safeCallbackUrl(callbackUrl, role) {
    if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//"))
        return ROLE_HOME[role];
    const required = requiredRoleFor(callbackUrl.split("?")[0]);
    return required === null || required === role ? callbackUrl : ROLE_HOME[role];
}
