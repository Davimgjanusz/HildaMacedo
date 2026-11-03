"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { UserPlus } from "lucide-react";
import { cadastrarCliente } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input, a11y } from "@/components/ui/form-controls";
import { MaskedInput } from "@/components/ui/masked-input";
import { mascaraNome, mascaraTelefone } from "@/lib/mascaras";
import { applyServerErrors } from "@/lib/forms";
import { cadastroSchema } from "@/lib/validations/auth";

export function SignupForm() {
    const { register, control, handleSubmit, getValues, setError, formState: { errors, isSubmitting }, } = useForm({ resolver: zodResolver(cadastroSchema) });

    async function onSubmit() {
        // Envia os valores crus (mascarados): o servidor valida com o mesmo schema.
        // Em caso de sucesso a action redireciona para a área do cliente.
        const result = await cadastrarCliente(getValues());
        if (!result.ok) {
            applyServerErrors(result, setError);
            toast.error(result.message);
        }
    }

    return (<form onSubmit={handleSubmit(onSubmit, () => toast.error("Verifique os campos destacados."))} noValidate className="flex flex-col gap-5">
      <Field label="Nome completo" htmlFor="cad-nome" error={errors.nome?.message} required>
        <MaskedInput control={control} name="nome" mask={mascaraNome} autoComplete="name" autoFocus {...a11y("cad-nome", errors.nome?.message)}/>
      </Field>
      <Field label="E-mail" htmlFor="cad-email" error={errors.email?.message} required>
        <Input type="email" autoComplete="email" inputMode="email" {...a11y("cad-email", errors.email?.message)} {...register("email")}/>
      </Field>
      <Field label="Telefone" htmlFor="cad-telefone" error={errors.telefone?.message} required>
        <MaskedInput control={control} name="telefone" mask={mascaraTelefone} type="tel" autoComplete="tel" inputMode="tel" placeholder="(11) 98888-0000" {...a11y("cad-telefone", errors.telefone?.message)}/>
      </Field>
      <Field label="Senha" htmlFor="cad-senha" error={errors.senha?.message} hint="Mínimo de 8 caracteres, com letras e números." required>
        <Input type="password" autoComplete="new-password" {...a11y("cad-senha", errors.senha?.message, true)} {...register("senha")}/>
      </Field>
      <Field label="Confirmar senha" htmlFor="cad-confirmar" error={errors.confirmarSenha?.message} required>
        <Input type="password" autoComplete="new-password" {...a11y("cad-confirmar", errors.confirmarSenha?.message)} {...register("confirmarSenha")}/>
      </Field>
      <Button type="submit" size="lg" loading={isSubmitting} className="mt-2 w-full">
        {!isSubmitting && <UserPlus className="size-4" aria-hidden/>}
        Criar conta
      </Button>
      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-charcoal underline underline-offset-4">Entrar</Link>
      </p>
    </form>);
}
