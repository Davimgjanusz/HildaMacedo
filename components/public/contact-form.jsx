"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Send } from "lucide-react";
import { submitLead } from "@/app/actions/public";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, a11y } from "@/components/ui/form-controls";
import { MaskedInput } from "@/components/ui/masked-input";
import { mascaraNome, mascaraTelefone } from "@/lib/mascaras";
import { applyServerErrors } from "@/lib/forms";
import { contactSchema } from "@/lib/validations/portal";

export function ContactForm() {
    const { register, control, handleSubmit, getValues, reset, setError, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(contactSchema),
        defaultValues: { interesse: "venda" },
    });

    async function onSubmit() {
        const result = await submitLead(getValues());
        if (!result.ok) {
            applyServerErrors(result, setError);
            toast.error(result.message);
            return;
        }
        toast.success(result.message);
        reset();
    }

    return (<form onSubmit={handleSubmit(onSubmit, () => toast.error("Verifique os campos destacados."))} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field label="Nome completo" htmlFor="contato-nome" error={errors.nome?.message} required>
        <MaskedInput control={control} name="nome" mask={mascaraNome} autoComplete="name" {...a11y("contato-nome", errors.nome?.message)}/>
      </Field>
      <Field label="E-mail" htmlFor="contato-email" error={errors.email?.message} required>
        <Input type="email" autoComplete="email" inputMode="email" {...a11y("contato-email", errors.email?.message)} {...register("email")}/>
      </Field>
      <Field label="Telefone" htmlFor="contato-telefone" error={errors.telefone?.message} required>
        <MaskedInput control={control} name="telefone" mask={mascaraTelefone} type="tel" autoComplete="tel" inputMode="tel" placeholder="(11) 98888-0000" {...a11y("contato-telefone", errors.telefone?.message)}/>
      </Field>
      <Field label="Tenho interesse em" htmlFor="contato-interesse" error={errors.interesse?.message} required>
        <Select {...a11y("contato-interesse", errors.interesse?.message)} {...register("interesse")}>
          <option value="venda">Comprar um imóvel</option>
          <option value="locacao">Alugar um imóvel</option>
          <option value="administracao">Administração do meu imóvel</option>
        </Select>
      </Field>
      <Field label="Mensagem" htmlFor="contato-mensagem" error={errors.mensagem?.message} required className="sm:col-span-2">
        <Textarea placeholder="Conte o que você procura: região, tamanho, prazo…" {...a11y("contato-mensagem", errors.mensagem?.message)} {...register("mensagem")}/>
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full sm:w-auto">
          {!isSubmitting && <Send className="size-4" aria-hidden/>}
          Enviar mensagem
        </Button>
      </div>
    </form>);
}
