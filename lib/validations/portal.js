import { z } from "zod";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { dataBrSchema, emailSchema, mesAnoSchema, moedaSchema, nomeCompletoSchema, telefoneSchema } from "./campos";

// ---------------------------------------------------------------------------
// Chamados de manutenção (inquilino)
// ---------------------------------------------------------------------------
export const ticketSchema = z.object({
    categoria: z.enum(["hidraulica", "eletrica", "estrutural", "eletrodomesticos", "outros"], "Selecione a categoria."),
    prioridade: z.enum(["baixa", "media", "alta"], "Selecione a prioridade."),
    titulo: z.string().trim().min(5, "Resuma o problema em ao menos 5 caracteres.").max(80, "Máximo de 80 caracteres."),
    descricao: z
        .string()
        .trim()
        .min(20, "Descreva o problema com ao menos 20 caracteres.")
        .max(1000, "Máximo de 1000 caracteres."),
});

// ---------------------------------------------------------------------------
// Agendamento de visitas (cliente)
// ---------------------------------------------------------------------------
export const HORARIOS_VISITA = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

export const visitSchema = z.object({
    imovelId: z.string().min(1, "Selecione o imóvel."),
    data: dataBrSchema("a data da visita")
        .refine((iso) => new Date(`${iso}T12:00:00`).getDay() !== 0, "Não realizamos visitas aos domingos.")
        .refine((iso) => differenceInCalendarDays(parseISO(iso), new Date()) <= 180, "Agende com até 6 meses de antecedência."),
    horario: z.enum(HORARIOS_VISITA, "Selecione um horário."),
    observacoes: z.string().trim().max(300, "Máximo de 300 caracteres.").optional(),
});

// ---------------------------------------------------------------------------
// Contato (landing page)
// ---------------------------------------------------------------------------
export const contactSchema = z.object({
    nome: nomeCompletoSchema,
    email: emailSchema,
    telefone: telefoneSchema,
    interesse: z.enum(["venda", "locacao", "administracao"], "Selecione seu interesse."),
    mensagem: z.string().trim().min(10, "Conte um pouco mais (mínimo de 10 caracteres).").max(1000),
});

// ---------------------------------------------------------------------------
// Financeiro (admin)
// ---------------------------------------------------------------------------
export const boletoSchema = z.object({
    contratoId: z.string().min(1, "Selecione o contrato."),
    competencia: mesAnoSchema,
    vencimento: dataBrSchema("o vencimento"),
    valor: moedaSchema("o valor"),
});

// ---------------------------------------------------------------------------
// Chat interno
// ---------------------------------------------------------------------------
export const messageSchema = z.object({
    threadId: z.string().min(1),
    texto: z.string().trim().min(1, "Digite uma mensagem.").max(2000, "Máximo de 2000 caracteres."),
});
