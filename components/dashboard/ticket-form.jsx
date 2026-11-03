"use client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Send } from "lucide-react";
import { createTicket } from "@/app/actions/portal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, a11y } from "@/components/ui/form-controls";
import { applyServerErrors } from "@/lib/forms";
import { ticketSchema } from "@/lib/validations/portal";
export function TicketForm() {
    const { register, handleSubmit, reset, setError, control, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(ticketSchema),
        defaultValues: { categoria: "hidraulica", prioridade: "media", titulo: "", descricao: "" },
    });
    const descricaoLength = useWatch({ control, name: "descricao" })?.length ?? 0;
    async function onSubmit(data) {
        const result = await createTicket(data);
        if (!result.ok) {
            applyServerErrors(result, setError);
            toast.error(result.message);
            return;
        }
        toast.success(result.message);
        reset();
    }
    return (<form onSubmit={handleSubmit(onSubmit, () => toast.error("Verifique os campos destacados."))} noValidate className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
      <Field label="Categoria" htmlFor="t-categoria" error={errors.categoria?.message} required>
        <Select {...a11y("t-categoria", errors.categoria?.message)} {...register("categoria")}>
          <option value="hidraulica">Hidráulica</option>
          <option value="eletrica">Elétrica</option>
          <option value="estrutural">Estrutural</option>
          <option value="eletrodomesticos">Eletrodomésticos</option>
          <option value="outros">Outros</option>
        </Select>
      </Field>
      <Field label="Prioridade" htmlFor="t-prioridade" error={errors.prioridade?.message} required>
        <Select {...a11y("t-prioridade", errors.prioridade?.message)} {...register("prioridade")}>
          <option value="baixa">Baixa — pode aguardar</option>
          <option value="media">Média — afeta o uso</option>
          <option value="alta">Alta — urgente</option>
        </Select>
      </Field>
      <Field label="Resumo do problema" htmlFor="t-titulo" error={errors.titulo?.message} required className="sm:col-span-2">
        <Input placeholder="Ex.: Vazamento no chuveiro do banheiro social" {...a11y("t-titulo", errors.titulo?.message)} {...register("titulo")}/>
      </Field>
      <Field label="Descrição" htmlFor="t-descricao" error={errors.descricao?.message} hint={`${descricaoLength}/1000 — informe onde, desde quando e o que já foi tentado.`} required className="sm:col-span-2">
        <Textarea rows={5} {...a11y("t-descricao", errors.descricao?.message, true)} {...register("descricao")}/>
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
          {!isSubmitting && <Send className="size-4" aria-hidden/>}
          Abrir chamado
        </Button>
      </div>
    </form>);
}
