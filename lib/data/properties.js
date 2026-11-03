import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./store";
export const PROPERTIES_TAG = "imoveis";
/** Leitura cacheada — invalidada com `updateTag(PROPERTIES_TAG)` após cada alteração. */
export async function getProperties() {
    "use cache";
    cacheTag(PROPERTIES_TAG);
    cacheLife("hours");
    return structuredClone(db.properties);
}
export async function getPropertyById(id) {
    const all = await getProperties();
    return all.find((p) => p.id === id) ?? null;
}
export async function getFeaturedProperties(limit = 6) {
    const all = await getProperties();
    return all.filter((p) => p.destaque && p.status === "disponivel").slice(0, limit);
}
function normalize(text) {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
export async function searchProperties(filters) {
    const all = await getProperties();
    const q = filters.q ? normalize(filters.q) : null;
    const result = all.filter((p) => {
        if (p.status !== "disponivel" && p.status !== "reservado")
            return false;
        if (filters.finalidade && p.finalidade !== filters.finalidade)
            return false;
        if (filters.tipo && p.tipo !== filters.tipo)
            return false;
        if (filters.precoMax && p.preco > filters.precoMax)
            return false;
        if (filters.quartos && p.quartos < filters.quartos)
            return false;
        if (q && !normalize(`${p.titulo} ${p.bairro} ${p.cidade}`).includes(q))
            return false;
        return true;
    });
    switch (filters.ordem) {
        case "menor-preco":
            return result.sort((a, b) => a.preco - b.preco);
        case "maior-preco":
            return result.sort((a, b) => b.preco - a.preco);
        default:
            return result.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    }
}
// ---------------------------------------------------------------------------
// Escrita (somente via Server Actions protegidas)
// ---------------------------------------------------------------------------
export function insertProperty(property) {
    db.properties.unshift(property);
}
export function replaceProperty(id, data) {
    const index = db.properties.findIndex((p) => p.id === id);
    if (index === -1)
        return false;
    db.properties[index] = { ...db.properties[index], ...data };
    return true;
}
export function removeProperty(id) {
    const index = db.properties.findIndex((p) => p.id === id);
    if (index === -1)
        return false;
    db.properties.splice(index, 1);
    return true;
}
export function propertyIdExists(id) {
    return db.properties.some((p) => p.id === id);
}
