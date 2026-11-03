"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Save } from "lucide-react";
import { saveProperty } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, a11y } from "@/components/ui/form-controls";
import { MaskedInput } from "@/components/ui/masked-input";
import { Card, CardHeader } from "@/components/ui/primitives";
import { applyServerErrors } from "@/lib/forms";
import { mascaraInteiro, mascaraMoeda, mascaraNome, mascaraUF, moedaDeNumero } from "@/lib/mascaras";
import { propertySchema } from "@/lib/validations/property";

function toFormValues(p) {
    if (!p) {
        // Valores vazios explícitos: assim a validação mostra "Informe ..." e não "valor indefinido".
        return {
            titulo: "", finalidade: "venda", tipo: "apartamento", status: "disponivel", bairro: "", cidade: "", uf: "SP",
            preco: "", condominio: "", iptu: "", area: "", quartos: "", suites: "", banheiros: "", vagas: "",
            descricao: "", caracteristicas: "", imagens: "", plantas: "", destaque: false,
        };
    }
    return {
        ...p,
        preco: moedaDeNumero(p.preco),
        condominio: p.condominio !== undefined ? moedaDeNumero(p.condominio) : "",
        iptu: p.iptu !== undefined ? moedaDeNumero(p.iptu) : "",
        area: String(p.area),
        quartos: String(p.quartos),
        suites: String(p.suites),
        banheiros: String(p.banheiros),
        vagas: String(p.vagas),
        caracteristicas: p.caracteristicas.join(", "),
        imagens: p.imagens.join("\n"),
        plantas: p.plantas.map((pl) => `${pl.nome} | ${pl.area} | ${pl.imagem}`).join("\n"),
    };
}

export function PropertyForm({ property }) {
    const router = useRouter();
    const { register, control, handleSubmit, getValues, setError, formState: { errors, isSubmitting, isDirty }, } = useForm({
        resolver: zodResolver(propertySchema),
        defaultValues: toFormValues(property),
    });

    async function onSubmit() {
        // Envia os valores crus (mascarados): o servidor valida e converte com o mesmo schema.
        const result = await saveProperty(property?.id ?? null, getValues());
        if (!result.ok) {
            applyServerErrors(result, setError);
            toast.error(result.message);
            return;
        }
        toast.success(result.message);
        router.push("/admin/imoveis");
    }

    const e = errors;
    return (<form onSubmit={handleSubmit(onSubmit, () => toast.error("Corrija os campos destacados antes de salvar."))} noValidate className="space-y-6">
      <Card>
        <CardHeader title="Informações principais"/>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          <Field label="Título do anúncio" htmlFor="titulo" error={e.titulo?.message} required className="sm:col-span-2 lg:col-span-4">
            <Input {...a11y("titulo", e.titulo?.message)} {...register("titulo")}/>
          </Field>
          <Field label="Finalidade" htmlFor="finalidade" error={e.finalidade?.message} required>
            <Select {...a11y("finalidade", e.finalidade?.message)} {...register("finalidade")}>
              <option value="venda">Venda</option>
              <option value="locacao">Locação</option>
            </Select>
          </Field>
          <Field label="Tipo" htmlFor="tipo" error={e.tipo?.message} required>
            <Select {...a11y("tipo", e.tipo?.message)} {...register("tipo")}>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="cobertura">Cobertura</option>
              <option value="comercial">Comercial</option>
              <option value="terreno">Terreno</option>
            </Select>
          </Field>
          <Field label="Status" htmlFor="status" error={e.status?.message} required>
            <Select {...a11y("status", e.status?.message)} {...register("status")}>
              <option value="disponivel">Disponível</option>
              <option value="reservado">Reservado</option>
              <option value="vendido">Vendido</option>
              <option value="alugado">Alugado</option>
            </Select>
          </Field>
          <div className="flex items-end pb-3">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" className="size-4 accent-charcoal" {...register("destaque")}/>
              Exibir nos destaques da home
            </label>
          </div>
          <Field label="Bairro" htmlFor="bairro" error={e.bairro?.message} required className="lg:col-span-2">
            <MaskedInput control={control} name="bairro" mask={mascaraNome} {...a11y("bairro", e.bairro?.message)}/>
          </Field>
          <Field label="Cidade" htmlFor="cidade" error={e.cidade?.message} required>
            <MaskedInput control={control} name="cidade" mask={mascaraNome} {...a11y("cidade", e.cidade?.message)}/>
          </Field>
          <Field label="UF" htmlFor="uf" error={e.uf?.message} required>
            <MaskedInput control={control} name="uf" mask={mascaraUF} placeholder="SP" {...a11y("uf", e.uf?.message)}/>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Valores e metragem"/>
        <div className="grid gap-5 p-5 sm:grid-cols-3 sm:p-6 lg:grid-cols-4">
          <Field label="Preço" htmlFor="preco" error={e.preco?.message} hint="Para locação, valor mensal." required>
            <MaskedInput control={control} name="preco" mask={mascaraMoeda} inputMode="numeric" placeholder="R$ 0,00" {...a11y("preco", e.preco?.message, true)}/>
          </Field>
          <Field label="Condomínio" htmlFor="condominio" error={e.condominio?.message}>
            <MaskedInput control={control} name="condominio" mask={mascaraMoeda} inputMode="numeric" placeholder="R$ 0,00" {...a11y("condominio", e.condominio?.message)}/>
          </Field>
          <Field label="IPTU mensal" htmlFor="iptu" error={e.iptu?.message}>
            <MaskedInput control={control} name="iptu" mask={mascaraMoeda} inputMode="numeric" placeholder="R$ 0,00" {...a11y("iptu", e.iptu?.message)}/>
          </Field>
          <Field label="Área útil (m²)" htmlFor="area" error={e.area?.message} required>
            <MaskedInput control={control} name="area" mask={mascaraInteiro} inputMode="numeric" {...a11y("area", e.area?.message)}/>
          </Field>
          <Field label="Quartos" htmlFor="quartos" error={e.quartos?.message} required>
            <MaskedInput control={control} name="quartos" mask={mascaraInteiro} inputMode="numeric" {...a11y("quartos", e.quartos?.message)}/>
          </Field>
          <Field label="Suítes" htmlFor="suites" error={e.suites?.message} required>
            <MaskedInput control={control} name="suites" mask={mascaraInteiro} inputMode="numeric" {...a11y("suites", e.suites?.message)}/>
          </Field>
          <Field label="Banheiros" htmlFor="banheiros" error={e.banheiros?.message} required>
            <MaskedInput control={control} name="banheiros" mask={mascaraInteiro} inputMode="numeric" {...a11y("banheiros", e.banheiros?.message)}/>
          </Field>
          <Field label="Vagas" htmlFor="vagas" error={e.vagas?.message} required>
            <MaskedInput control={control} name="vagas" mask={mascaraInteiro} inputMode="numeric" {...a11y("vagas", e.vagas?.message)}/>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Descrição, imagens e plantas"/>
        <div className="grid gap-5 p-5 sm:p-6">
          <Field label="Descrição" htmlFor="descricao" error={e.descricao?.message} required>
            <Textarea rows={5} {...a11y("descricao", e.descricao?.message)} {...register("descricao")}/>
          </Field>
          <Field label="Diferenciais" htmlFor="caracteristicas" hint="Separe por vírgulas. Ex.: Piscina, Varanda gourmet, Pet friendly" error={e.caracteristicas?.message}>
            <Input {...a11y("caracteristicas", e.caracteristicas?.message, true)} {...register("caracteristicas")}/>
          </Field>
          <Field label="Imagens" htmlFor="imagens" hint="Uma URL https por linha. A primeira é a capa." error={e.imagens?.message} required>
            <Textarea rows={4} className="font-mono text-xs" {...a11y("imagens", e.imagens?.message, true)} {...register("imagens")}/>
          </Field>
          <Field label="Plantas" htmlFor="plantas" hint='Uma por linha no formato "Nome | área | https://url-da-imagem".' error={e.plantas?.message}>
            <Textarea rows={3} className="font-mono text-xs" {...a11y("plantas", e.plantas?.message, true)} {...register("plantas")}/>
          </Field>
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={isSubmitting} disabled={Boolean(property) && !isDirty}>
          {!isSubmitting && <Save className="size-4" aria-hidden/>}
          {property ? "Salvar alterações" : "Cadastrar imóvel"}
        </Button>
      </div>
    </form>);
}
