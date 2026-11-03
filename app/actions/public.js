"use server";
import { z } from "zod";
import { refresh } from "next/cache";
import { authorize, getCurrentUser } from "@/lib/auth/dal";
import { insertLead, toggleFavoriteFor } from "@/lib/data/portal";
import { getPropertyById } from "@/lib/data/properties";
import { contactSchema } from "@/lib/validations/portal";
export async function submitLead(input) {
    const parsed = contactSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, message: "Verifique os campos destacados.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }
    insertLead({
        id: `ld-${crypto.randomUUID().slice(0, 8)}`,
        ...parsed.data,
        criadoEm: new Date().toISOString().slice(0, 10),
    });
    return { ok: true, message: "Mensagem enviada! Nossa equipe retornará em até 1 dia útil." };
}
export async function toggleFavorite(imovelId) {
    const user = await authorize("client");
    if (!user) {
        const anyUser = await getCurrentUser();
        return anyUser
            ? { ok: false, message: "Favoritos estão disponíveis apenas na área do cliente." }
            : { ok: false, needsLogin: true, message: "Entre na sua conta para salvar favoritos." };
    }
    if (!(await getPropertyById(imovelId)))
        return { ok: false, message: "Imóvel não encontrado." };
    const favorito = toggleFavoriteFor(user.id, imovelId);
    refresh();
    return { ok: true, favorito, message: favorito ? "Imóvel salvo nos favoritos." : "Imóvel removido dos favoritos." };
}
