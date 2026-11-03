import Link from "next/link";
import { Logo } from "@/components/public/logo";
import { buttonClasses } from "@/components/ui/button";
export default function NotFound() {
    return (<main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <p className="eyebrow mt-6">Erro 404</p>
      <h1 className="text-4xl sm:text-5xl">Página não encontrada</h1>
      <p className="max-w-md text-muted">O endereço que você procura não existe ou o imóvel não está mais disponível.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClasses("primary", "md")}>Ir para o início</Link>
        <Link href="/imoveis" className={buttonClasses("outline", "md")}>Ver imóveis</Link>
      </div>
    </main>);
}
