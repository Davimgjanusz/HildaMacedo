import Image from "next/image";
import { Logo } from "@/components/public/logo";
import { SignupForm } from "@/components/public/signup-form";

export const metadata = { title: "Criar conta" };

const IMAGE = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";

export default function CadastroPage() {
    return (<main className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src={IMAGE} alt="" fill priority sizes="50vw" className="object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" aria-hidden/>
        <blockquote className="absolute inset-x-12 bottom-12 max-w-md font-serif text-3xl leading-snug text-white">
          “Sua próxima casa começa com uma conta.”
        </blockquote>
      </div>

      <div className="flex flex-col px-6 py-10 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <p className="eyebrow mb-3">Área do cliente</p>
          <h1 className="text-4xl">Criar conta</h1>
          <p className="mb-8 mt-2 text-sm text-muted">
            Salve imóveis favoritos e agende visitas online. Inquilinos recebem o acesso diretamente da nossa administração.
          </p>
          <SignupForm/>
        </div>
      </div>
    </main>);
}
