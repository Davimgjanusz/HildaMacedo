import { z } from "zod";
import { inteiroSchema, moedaOpcionalSchema, moedaSchema } from "./campos";

const linhas = (text) => text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

export const propertySchema = z
    .object({
    titulo: z.string().trim().min(5, "O título deve ter ao menos 5 caracteres.").max(90, "Máximo de 90 caracteres."),
    finalidade: z.enum(["venda", "locacao"], "Selecione a finalidade."),
    tipo: z.enum(["apartamento", "casa", "cobertura", "comercial", "terreno"], "Selecione o tipo."),
    status: z.enum(["disponivel", "reservado", "vendido", "alugado"], "Selecione o status."),
    bairro: z.string().trim().min(2, "Informe o bairro.").max(60, "Máximo de 60 caracteres."),
    cidade: z.string().trim().min(2, "Informe a cidade.").max(60, "Máximo de 60 caracteres."),
    uf: z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-Z]{2}$/, "Informe a UF com 2 letras."),
    preco: moedaSchema("o preço"),
    condominio: moedaOpcionalSchema,
    iptu: moedaOpcionalSchema,
    area: inteiroSchema("a área útil", { min: 10, max: 100000 }),
    quartos: inteiroSchema("o número de quartos", { max: 20 }),
    suites: inteiroSchema("o número de suítes", { max: 20 }),
    banheiros: inteiroSchema("o número de banheiros", { max: 20 }),
    vagas: inteiroSchema("o número de vagas", { max: 50 }),
    descricao: z.string().trim().min(30, "Descreva o imóvel com ao menos 30 caracteres.").max(2000),
    caracteristicas: z
        .string()
        .transform((text) => text
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)),
    imagens: z
        .string()
        .transform(linhas)
        .pipe(z
        .array(z.url({ protocol: /^https$/, error: "Cada linha deve ser uma URL https válida." }))
        .min(1, "Adicione ao menos uma imagem.")),
    plantas: z
        .string()
        .transform(linhas)
        .transform((rows, ctx) => rows.map((row, index) => {
        const [nome, area, imagem] = row.split("|").map((part) => part.trim());
        const parsedArea = Number(area);
        if (!nome || !Number.isFinite(parsedArea) || !/^(https:\/\/|\/(?!\/))/.test(imagem ?? "")) {
            ctx.addIssue({
                code: "custom",
                message: `Linha ${index + 1}: use o formato "Nome | área | https://url-da-imagem" (ou /caminho-local).`,
            });
            return z.NEVER;
        }
        return { nome, area: parsedArea, imagem };
    })),
    destaque: z.boolean(),
})
    .refine((imovel) => imovel.suites <= imovel.quartos, {
    message: "Suítes não podem ser maiores que o número de quartos.",
    path: ["suites"],
});
