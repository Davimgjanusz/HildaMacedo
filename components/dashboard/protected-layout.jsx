import { Suspense } from "react";
import { DashboardShell } from "./dashboard-shell";
import { PageSkeleton, RequireRole, UserMenu, UserMenuSkeleton } from "./auth-gate";
/**
 * A casca (sidebar, navegação) é estática e carrega instantaneamente;
 * o conteúdo só é renderizado depois que o servidor confirma o perfil.
 */
export function ProtectedLayout({ area, children }) {
    return (<DashboardShell area={area} user={<Suspense fallback={<UserMenuSkeleton />}>
          <UserMenu />
        </Suspense>}>
      <Suspense fallback={<PageSkeleton />}>
        <RequireRole role={area}>{children}</RequireRole>
      </Suspense>
    </DashboardShell>);
}
