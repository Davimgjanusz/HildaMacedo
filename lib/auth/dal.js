import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLE_HOME } from "./roles";
/**
 * Data Access Layer de autenticação. Toda página, Server Action e Route Handler
 * protegido passa por aqui — a verificação acontece no servidor, perto dos dados.
 */
export const getCurrentUser = cache(async () => {
    const session = await auth();
    if (!session?.user?.id || !session.user.role)
        return null;
    return {
        id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: session.user.role,
    };
});
/** Para páginas: redireciona quem não tem sessão ou não possui o perfil exigido. */
export async function requireRole(...roles) {
    const user = await getCurrentUser();
    if (!user)
        redirect("/login");
    if (!roles.includes(user.role))
        redirect(ROLE_HOME[user.role]);
    return user;
}
/** Para Server Actions: não redireciona, devolve null para a action responder com erro. */
export async function authorize(...roles) {
    const user = await getCurrentUser();
    return user && roles.includes(user.role) ? user : null;
}
