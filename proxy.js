import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { ROLE_HOME, requiredRoleFor } from "@/lib/auth/roles";
const { auth } = NextAuth(authConfig);
/**
 * Verificação otimista (antes de renderizar). A autorização definitiva é refeita
 * no servidor por `requireRole` / `authorize` em cada layout, página e action.
 */
export const proxy = auth((req) => {
    const { pathname, search } = req.nextUrl;
    const user = req.auth?.user;
    if (pathname === "/login") {
        return user?.role ? NextResponse.redirect(new URL(ROLE_HOME[user.role], req.url)) : NextResponse.next();
    }
    const required = requiredRoleFor(pathname);
    if (!required)
        return NextResponse.next();
    if (!user?.role) {
        const url = new URL("/login", req.url);
        url.searchParams.set("callbackUrl", pathname + search);
        return NextResponse.redirect(url);
    }
    if (user.role !== required) {
        return NextResponse.redirect(new URL(ROLE_HOME[user.role], req.url));
    }
    return NextResponse.next();
});
export const config = {
    matcher: ["/admin/:path*", "/portal/:path*", "/login"],
};
