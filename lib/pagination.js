/** Tamanho padrão das listas paginadas. */
export const PAGE_SIZE = 10;

/** Lê o número da página a partir de um valor de searchParams (inválido → 1). */
export function parsePage(raw) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : 1;
}

/**
 * Fatia uma lista em páginas. A página solicitada é limitada ao intervalo válido,
 * então um link antigo (ex.: página 9 depois de filtrar) nunca fica vazio.
 */
export function paginate(items, requestedPage, pageSize = PAGE_SIZE) {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, requestedPage), totalPages);
    const start = (page - 1) * pageSize;
    return {
        items: items.slice(start, start + pageSize),
        page,
        pageSize,
        total,
        totalPages,
        from: total ? start + 1 : 0,
        to: Math.min(start + pageSize, total),
    };
}

/** Monta o href de uma página preservando os demais parâmetros (filtros) da URL. */
export function buildPageHref({ basePath, query = {}, paramName = "pagina", page, hash }) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (key === paramName || value == null) continue;
        for (const v of Array.isArray(value) ? value : [value]) params.append(key, v);
    }
    if (page > 1) params.set(paramName, String(page));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}${hash ? `#${hash}` : ""}`;
}

/** Sequência de páginas com reticências: [1, "…", 4, 5, 6, "…", 20]. */
export function pageSequence(page, totalPages) {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, page - 1, page, page + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    const out = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
        out.push(p);
    });
    return out;
}
