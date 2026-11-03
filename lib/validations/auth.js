import { z } from "zod";
import { emailSchema, nomeCompletoSchema, senhaSchema, telefoneSchema } from "./campos";

export const loginSchema = z.object({
    email: z.email("Informe um e-mail válido."),
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

// Cadastro público: somente clientes. Inquilinos são cadastrados pela administração.
export const cadastroSchema = z
    .object({
    nome: nomeCompletoSchema,
    email: emailSchema,
    telefone: telefoneSchema,
    senha: senhaSchema,
    confirmarSenha: z.string(),
})
    .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
});
