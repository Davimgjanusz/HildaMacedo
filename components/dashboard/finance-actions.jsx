"use client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { CheckCheck, FilePlus2, RefreshCw } from "lucide-react";
import { issueInvoice, markInvoicePaid, reconcileInvoices } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Field, Select, a11y } from "@/components/ui/form-controls";
import { MaskedInput } from "@/components/ui/masked-input";
import { applyServerErrors } from "@/lib/forms";
import { isoParaDataBr, isoParaMesAno, mascaraData, mascaraMesAno, mascaraMoeda, moedaDeNumero } from "@/lib/mascaras";
import { boletoSchema } from "@/lib/validations/portal";

export function IssueInvoiceForm({ contracts, competencia }) {
    const first = contracts[0];
    const { register, control, handleSubmit, getValues, setValue, setError, reset, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(boletoSchema),
        defaultValues: {
            contratoId: first?.id ?? "",
            competencia: isoParaMesAno(competencia),
            valor: first ? moedaDeNumero(first.valor) : "",
            vencimento: first ? isoParaDataBr(`${competencia}-${String(first.diaVencimento).padStart(2, "0")}`) : "",
        },
    });

    // Ao trocar o contrato, sugere valor e vencimento do próprio contrato
    const contratoField = register("contratoId", {
        onChange: (e) => {
            const c = contracts.find((x) => x.id === e.target.value);
            if (!c)
                return;
            setValue("valor", moedaDeNumero(c.valor));
            setValue("vencimento", isoParaDataBr(`${competencia}-${String(c.diaVencimento).padStart(2, "0")}`));
        },
    });

    async function onSubmit() {
        const result = await issueInvoice(getValues());
        if (!result.ok) {
            applyServerErrors(result, setError);
            toast.error(result.message);
            return;
        }
        toast.success(result.message);
        reset(getValues());
    }

    return (<form onSubmit={handleSubmit(onSubmit, () => toast.error("Verifique os campos destacados."))} noValidate className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
      <Field label="Contrato" htmlFor="b-contrato" error={errors.contratoId?.message} required className="sm:col-span-2">
        <Select {...a11y("b-contrato", errors.contratoId?.message)} {...contratoField}>
          {contracts.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
        </Select>
      </Field>
      <Field label="Competência" htmlFor="b-comp" error={errors.competencia?.message} required>
        <MaskedInput control={control} name="competencia" mask={mascaraMesAno} inputMode="numeric" placeholder="MM/AAAA" {...a11y("b-comp", errors.competencia?.message)}/>
      </Field>
      <Field label="Vencimento" htmlFor="b-venc" error={errors.vencimento?.message} required>
        <MaskedInput control={control} name="vencimento" mask={mascaraData} inputMode="numeric" placeholder="DD/MM/AAAA" {...a11y("b-venc", errors.vencimento?.message)}/>
      </Field>
      <Field label="Valor" htmlFor="b-valor" error={errors.valor?.message} required className="sm:col-span-2">
        <MaskedInput control={control} name="valor" mask={mascaraMoeda} inputMode="numeric" placeholder="R$ 0,00" {...a11y("b-valor", errors.valor?.message)}/>
      </Field>
      <Button type="submit" loading={isSubmitting} className="sm:col-span-2">
        {!isSubmitting && <FilePlus2 className="size-4" aria-hidden/>}
        Emitir boleto + Pix
      </Button>
    </form>);
}

export function ReconcileButton() {
    const [pending, startTransition] = useTransition();
    return (<Button variant="outline" loading={pending} onClick={() => startTransition(async () => {
            const result = await reconcileInvoices();
            (result.ok ? toast.success : toast.warning)(result.message);
        })}>
      {!pending && <RefreshCw className="size-4" aria-hidden/>}
      Conciliar com Santander
    </Button>);
}

export function MarkPaidButton({ id }) {
    const [pending, startTransition] = useTransition();
    return (<Button variant="ghost" size="sm" loading={pending} onClick={() => {
            if (!window.confirm("Registrar baixa manual deste boleto?"))
                return;
            startTransition(async () => {
                const result = await markInvoicePaid(id);
                (result.ok ? toast.success : toast.error)(result.message);
            });
        }}>
      {!pending && <CheckCheck className="size-4" aria-hidden/>}
      Dar baixa
    </Button>);
}
