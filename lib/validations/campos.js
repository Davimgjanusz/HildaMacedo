import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { dataBrParaIso, mesAnoParaIso, parseMoeda } from "@/lib/mascaras";

// Blocos de validação reutilizados entre cadastro, contato, visitas, financeiro e imóveis.
// Os valores chegam mascarados (ex.: "(11) 98888-0000", "R$ 1.000,00", "25/12/2026")
// e são convertidos para o tipo de dado correto na própria validação.

/** Telefone com DDD, validado pela libphonenumber (números brasileiros). */
export const telefoneSchema = z
    .string()
    .trim()
    .min(1, "Informe o telefone.")
    .refine((valor) => isValidPhoneNumber(valor, "BR"), "Informe um telefone válido com DDD, ex.: (11) 98888-0000.");

/** E-mail normalizado para minúsculas, sem espaços. */
export const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Informe um e-mail válido."));

/** Nome e sobrenome: pelo menos duas palavras. */
export const nomeCompletoSchema = z
    .string()
    .trim()
    .min(5, "Informe nome e sobrenome.")
    .max(80, "Máximo de 80 caracteres.")
    .refine((valor) => valor.split(/\s+/).length >= 2, "Informe nome e sobrenome.");

/** Senha com ao menos 8 caracteres, uma letra e um número. */
export const senhaSchema = z
    .string()
    .min(8, "A senha deve ter ao menos 8 caracteres.")
    .regex(/[A-Za-z]/, "A senha precisa de ao menos uma letra.")
    .regex(/\d/, "A senha precisa de ao menos um número.");

/** Valor em reais obrigatório e maior que zero. Entrega número. */
export const moedaSchema = (campo) =>
    z
        .string()
        .min(1, `Informe ${campo}.`)
        .refine((valor) => parseMoeda(valor) > 0, "Use um valor maior que zero.")
        .transform((valor) => parseMoeda(valor));

/** Valor em reais opcional. Vazio vira undefined. */
export const moedaOpcionalSchema = z
    .string()
    .optional()
    .refine((valor) => !valor || parseMoeda(valor) >= 0, "O valor não pode ser negativo.")
    .transform((valor) => (valor ? parseMoeda(valor) : undefined));

/** Número inteiro dentro de um intervalo. Entrega número. */
export const inteiroSchema = (campo, { min = 0, max = 999 } = {}) =>
    z
        .string()
        .min(1, `Informe ${campo}.`)
        .refine((valor) => /^\d+$/.test(valor), "Use apenas números inteiros.")
        .transform((valor) => Number(valor))
        .refine((numero) => numero >= min && numero <= max, `Use um valor entre ${min} e ${max}.`);

/** Data DD/MM/AAAA que existe no calendário. Entrega ISO AAAA-MM-DD. */
export const dataBrSchema = (campo = "a data") =>
    z
        .string()
        .min(1, `Informe ${campo}.`)
        .refine((valor) => dataBrParaIso(valor) !== null, "Informe uma data válida no formato DD/MM/AAAA.")
        .transform((valor) => dataBrParaIso(valor));

/** Competência MM/AAAA. Entrega ISO AAAA-MM. */
export const mesAnoSchema = z
    .string()
    .min(1, "Informe a competência.")
    .refine((valor) => mesAnoParaIso(valor) !== null, "Informe a competência no formato MM/AAAA.")
    .transform((valor) => mesAnoParaIso(valor));
