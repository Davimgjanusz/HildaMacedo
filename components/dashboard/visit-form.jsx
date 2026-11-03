"use client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { CalendarCheck, X } from "lucide-react";
import { cancelVisit, scheduleVisit } from "@/app/actions/portal";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea, a11y } from "@/components/ui/form-controls";
import { MaskedInput } from "@/components/ui/masked-input";
import { mascaraData } from "@/lib/mascaras";
import { applyServerErrors } from "@/lib/forms";
import { HORARIOS_VISITA, visitSchema } from "@/lib/validations/portal";

export function VisitForm({ properties, initialId, minDate }) {
    const { register, control, handleSubmit, getValues, reset, setError, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(visitSchema),
        defaultValues: { imovelId: initialId ?? "", data: "", observacoes: "" },
    });

    async function onSubmit(data) {
        // `data` já está convertido (ISO); a action valida de novo com os valores crus.
        if (data.data < minDate) {
            setError("data", { message: "Escolha uma data a partir de amanhã." });
            return;
        }
        const result = await scheduleVisit(getValues());
        if (!result.ok) {
            applyServerErrors(result, setError);
            toast.error(result.message);
            return;
        }
        toast.success(result.message);
        reset({ imovelId: "", data: "", observacoes: "" });
    }

    return (<form onSubmit={handleSubmit(onSubmit, () => toast.error("Verifique os campos destacados."))} noValidate className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
      <Field label="Imóvel" htmlFor="v-imovel" error={errors.imovelId?.message} required className="sm:col-span-2">
        <Select {...a11y("v-imovel", errors.imovelId?.message)} {...register("imovelId")}>
          <option value="">Selecione…</option>
          {properties.map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
        </Select>
      </Field>
      <Field label="Data" htmlFor="v-data" error={errors.data?.message} hint="DD/MM/AAAA · segunda a sábado." required>
        <MaskedInput control={control} name="data" mask={mascaraData} inputMode="numeric" placeholder="DD/MM/AAAA" {...a11y("v-data", errors.data?.message, true)}/>
      </Field>
      <Field label="Horário" htmlFor="v-horario" error={errors.horario?.message} required>
        <Select defaultValue="" {...a11y("v-horario", errors.horario?.message)} {...register("horario")}>
          <option value="" disabled>Selecione…</option>
          {HORARIOS_VISITA.map((h) => (<option key={h} value={h}>{h}</option>))}
        </Select>
      </Field>
      <Field label="Observações" htmlFor="v-obs" error={errors.observacoes?.message} className="sm:col-span-2">
        <Textarea rows={3} placeholder="Ex.: levarei meu arquiteto" {...a11y("v-obs", errors.observacoes?.message)} {...register("observacoes")}/>
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
          {!isSubmitting && <CalendarCheck className="size-4" aria-hidden/>}
          Agendar visita
        </Button>
      </div>
    </form>);
}

export function CancelVisitButton({ id }) {
    const [pending, startTransition] = useTransition();
    return (<Button variant="ghost" size="sm" loading={pending} onClick={() => {
            if (!window.confirm("Cancelar esta visita?"))
                return;
            startTransition(async () => {
                const result = await cancelVisit(id);
                (result.ok ? toast.success : toast.error)(result.message);
            });
        }}>
      {!pending && <X className="size-4" aria-hidden/>}
      Cancelar
    </Button>);
}
