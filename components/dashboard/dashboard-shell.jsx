"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/public/logo";
import { NAV } from "./nav-config";
import { cn } from "@/lib/cn";
/**
 * Estrutura dos painéis: sidebar fixa em telas ≥ 1024px e menu gaveta (drawer)
 * acionado pelo botão hambúrguer abaixo disso.
 */
export function DashboardShell({ area, user, children }) {
    const [open, setOpen] = useState(false);
    const closeRef = useRef(null);
    const nav = NAV[area];
    useEffect(() => {
        if (!open)
            return;
        closeRef.current?.focus();
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open]);
    const sidebar = (<div className="flex h-full flex-col">
      <div className="flex h-20 items-center justify-between px-6">
        <Logo />
        <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-sand-light/60 lg:hidden" aria-label="Fechar menu">
          <X className="size-5"/>
        </button>
      </div>
      <p className="eyebrow px-6 pb-3 pt-4">{nav.title}</p>
      <nav aria-label={nav.title} className="flex-1 overflow-y-auto px-3">
        {/* A rota atual só é conhecida em runtime; sem ela os links aparecem sem destaque */}
        <Suspense fallback={<NavList items={nav.items} pathname={null}/>}>
          <ActiveNavList items={nav.items} onNavigate={() => setOpen(false)}/>
        </Suspense>
      </nav>
      <div className="border-t border-line p-4">{user}</div>
    </div>);
    return (<div className="min-h-svh bg-offwhite lg:grid lg:grid-cols-[272px_1fr]">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-svh border-r border-line bg-surface lg:block">{sidebar}</aside>

      {/* Drawer mobile */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "visible" : "invisible")} aria-hidden={!open}>
        <div className={cn("absolute inset-0 bg-black/40 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)}/>
        <aside id="dashboard-drawer" role="dialog" aria-modal="true" aria-label="Menu de navegação" inert={!open} className={cn("absolute inset-y-0 left-0 w-[85%] max-w-xs bg-surface shadow-2xl transition-transform duration-300", open ? "translate-x-0" : "-translate-x-full")}>
          {sidebar}
        </aside>
      </div>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-offwhite/90 px-4 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full hover:bg-sand-light/60" aria-label="Abrir menu" aria-expanded={open} aria-controls="dashboard-drawer">
            <Menu className="size-5"/>
          </button>
          <span className="font-serif text-lg">{nav.title}</span>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>);
}
function ActiveNavList({ items, onNavigate }) {
    return <NavList items={items} pathname={usePathname()} onNavigate={onNavigate}/>;
}
function NavList({ items, pathname, onNavigate }) {
    return (<ul className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon, exact }) => {
            const active = pathname !== null && (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
            return (<li key={href}>
            <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors", active ? "bg-charcoal text-white" : "text-charcoal/75 hover:bg-sand-light/50 hover:text-charcoal")}>
              <Icon className={cn("size-4", active ? "text-sand" : "text-sand-dark")} aria-hidden/>
              {label}
            </Link>
          </li>);
        })}
    </ul>);
}
