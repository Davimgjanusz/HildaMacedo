import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/public/logo";
import { LoginForm } from "@/components/public/login-form";
import { Skeleton } from "@/components/ui/primitives";
export const metadata = { title: "Entrar" };
const IMAGE = "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80";
export default function LoginPage({ searchParams }) {
    return (<main className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src={IMAGE} alt="" fill priority sizes="50vw" className="object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" aria-hidden/>
        <blockquote className="absolute inset-x-12 bottom-12 max-w-md font-serif text-3xl leading-snug text-white">
          “Cada endereço conta uma história. Cuidamos da sua.”
        </blockquote>
      </div>

      <div className="flex flex-col px-6 py-10 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <p className="eyebrow mb-3">Área restrita</p>
          <h1 className="text-4xl">Bem-vindo(a)</h1>
          <p className="mb-8 mt-2 text-sm text-muted">
            Acesse o portal do inquilino, a área do cliente ou o painel administrativo.
          </p>
          <Suspense fallback={<Skeleton className="h-64"/>}>
            <LoginFormWithParams searchParams={searchParams}/>
          </Suspense>
          <p className="mt-6 text-center text-sm text-muted">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-charcoal underline underline-offset-4">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </main>);
}
async function LoginFormWithParams({ searchParams }) {
    const { callbackUrl } = await searchParams;
    return (<LoginForm callbackUrl={typeof callbackUrl === "string" ? callbackUrl : undefined} showDemo={process.env.HIDE_DEMO_LOGINS !== "true"}/>);
}
