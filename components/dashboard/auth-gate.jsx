import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { getCurrentUser, requireRole } from "@/lib/auth/dal";
import { Skeleton } from "@/components/ui/primitives";
/**
 * Verifica sessão e perfil no servidor ANTES de renderizar o conteúdo protegido.
 * Fica dentro de um <Suspense> no layout para não bloquear a casca estática.
 */
export async function RequireRole({ role, children }) {
    await requireRole(role);
    return <>{children}</>;
}
export async function UserMenu() {
    const user = await getCurrentUser();
    if (!user)
        return null;
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("");
    return (<div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sand-light font-serif text-sm text-sand-dark" aria-hidden>
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted">{user.email}</p>
      </div>
      <form action={logout}>
        <button type="submit" className="grid size-9 place-items-center rounded-full text-muted hover:bg-sand-light/60 hover:text-charcoal" aria-label="Sair" title="Sair">
          <LogOut className="size-4"/>
        </button>
      </form>
    </div>);
}
export function UserMenuSkeleton() {
    return (<div className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-full"/>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24"/>
        <Skeleton className="h-3 w-32"/>
      </div>
    </div>);
}
export function PageSkeleton() {
    return (<div className="space-y-6" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-10 w-64"/>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (<Skeleton key={i} className="h-36 rounded-2xl"/>))}
      </div>
      <Skeleton className="h-80 rounded-2xl"/>
    </div>);
}
