import "server-only";
import { connection } from "next/server";
/**
 * Data de hoje (AAAA-MM-DD) no fuso de São Paulo.
 * Chama `connection()` para que o valor seja calculado por requisição,
 * e não congelado no prerender (exigência do Cache Components).
 */
export async function getToday() {
    await connection();
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
