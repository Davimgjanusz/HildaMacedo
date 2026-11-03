"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Menu, UserPlus, X } from "lucide-react";
import { Logo } from "./logo";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
const LINKS = [
    { href: "/imoveis?finalidade=venda", label: "Comprar" },
    { href: "/imoveis?finalidade=locacao", label: "Alugar" },
    { href: "/#servicos", label: "Serviços" },
    { href: "/#sobre", label: "Sobre" },
    { href: "/#contato", label: "Contato" },
];
export function SiteHeader() {
    const pathname = usePathname();
    const overHero = pathname === "/";
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open]);
    const transparent = overHero && !scrolled && !open;
    return (<header className={cn("fixed inset-x-0 top-0 z-40 transition-all duration-300", transparent ? "bg-transparent" : "border-b border-line bg-offwhite/90 backdrop-blur-md")}>
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <Logo inverted={transparent}/>

        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {LINKS.map((link) => (<li key={link.href}>
                <Link href={link.href} className={cn("text-sm tracking-wide transition-colors", transparent ? "text-white/85 hover:text-white" : "text-charcoal/75 hover:text-charcoal")}>
                  {link.label}
                </Link>
              </li>))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className={buttonClasses(transparent ? "outlineLight" : "outline", "sm", "hidden sm:inline-flex")}>
            <LogIn className="size-4" aria-hidden/>
            Entrar
          </Link>
          <Link href="/cadastro" className={buttonClasses(transparent ? "secondary" : "primary", "sm", "hidden sm:inline-flex")}>
            <UserPlus className="size-4" aria-hidden/>
            Cadastrar
          </Link>
          <button type="button" className={cn("grid size-10 place-items-center rounded-full lg:hidden", transparent ? "text-white hover:bg-white/10" : "text-charcoal hover:bg-sand-light/60")} aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="menu-mobile" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="size-5"/> : <Menu className="size-5"/>}
          </button>
        </div>
      </div>

      <div id="menu-mobile" hidden={!open} className="h-[calc(100dvh-5rem)] overflow-y-auto border-t border-line bg-offwhite lg:hidden">
        <nav aria-label="Navegação mobile" className="container-page flex flex-col gap-1 py-6">
          {LINKS.map((link) => (<Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-line py-4 font-serif text-2xl">
              {link.label}
            </Link>))}
          <Link href="/login" onClick={() => setOpen(false)} className={buttonClasses("outline", "lg", "mt-6")}>
            <LogIn className="size-4" aria-hidden/>
            Entrar
          </Link>
          <Link href="/cadastro" onClick={() => setOpen(false)} className={buttonClasses("primary", "lg", "mt-3")}>
            <UserPlus className="size-4" aria-hidden/>
            Cadastrar
          </Link>
        </nav>
      </div>
    </header>);
}
