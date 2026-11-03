"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { LogIn } from "lucide-react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input, a11y } from "@/components/ui/form-controls";
import { applyServerErrors } from "@/lib/forms";
import { loginSchema } from "@/lib/validations/auth";
const DEMO = [
    { perfil: "Administração", email: "admin@hildamacedo.com.br", password: "admin123" },
    { perfil: "Inquilino", email: "inquilino@hildamacedo.com.br", password: "inquilino123" },
    { perfil: "Cliente", email: "cliente@hildamacedo.com.br", password: "cliente123" },
];
export function LoginForm({ callbackUrl, showDemo }) {
    const { register, handleSubmit, setValue, setError, formState: { errors, isSubmitting }, } = useForm({ resolver: zodResolver(loginSchema) });
    async function onSubmit(data) {
        // Em caso de sucesso a action redireciona; só voltamos aqui em erro.
        const result = await login(data, callbackUrl);
        if (!result.ok) {
            applyServerErrors(result, setError);
            toast.error(result.message);
        }
    }
    return (<>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <Field label="E-mail" htmlFor="login-email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" autoFocus {...a11y("login-email", errors.email?.message)} {...register("email")}/>
        </Field>
        <Field label="Senha" htmlFor="login-password" error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" {...a11y("login-password", errors.password?.message)} {...register("password")}/>
        </Field>
        <Button type="submit" size="lg" loading={isSubmitting} className="mt-2 w-full">
          {!isSubmitting && <LogIn className="size-4" aria-hidden/>}
          Entrar
        </Button>
      </form>

      {showDemo && (<div className="mt-10 rounded-xl border border-dashed border-sand bg-sand-light/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-sand-dark">Acessos de demonstração</p>
          <ul className="mt-3 grid gap-2">
            {DEMO.map((d) => (<li key={d.email}>
                <button type="button" className="flex w-full items-center justify-between rounded-lg bg-surface px-3 py-2 text-left text-sm ring-1 ring-line hover:ring-sand" onClick={() => {
                    setValue("email", d.email, { shouldValidate: true });
                    setValue("password", d.password, { shouldValidate: true });
                }}>
                  <span className="font-medium">{d.perfil}</span>
                  <span className="truncate pl-3 text-xs text-muted">{d.email}</span>
                </button>
              </li>))}
          </ul>
        </div>)}
    </>);
}
