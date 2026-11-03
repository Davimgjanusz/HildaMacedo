"use server";
import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import bcrypt from "bcryptjs";
import { findUserByEmail, insertUser } from "@/lib/data/portal";
import { safeCallbackUrl } from "@/lib/auth/roles";
import { cadastroSchema, loginSchema } from "@/lib/validations/auth";
export async function login(input, callbackUrl) {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, message: "Verifique os campos destacados.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }
    const user = await findUserByEmail(parsed.data.email);
    try {
        await signIn("credentials", {
            ...parsed.data,
            // Só redireciona para áreas que o perfil pode acessar
            redirectTo: user ? safeCallbackUrl(callbackUrl, user.role) : "/",
        });
    }
    catch (error) {
        if (error instanceof AuthError) {
            return { ok: false, message: "E-mail ou senha incorretos." };
        }
        throw error; // o redirect de sucesso também é lançado como exceção
    }
    return { ok: true, message: "Bem-vindo(a)!" };
}
export async function logout() {
    await signOut({ redirectTo: "/" });
}

/** Cadastro público: cria somente contas de cliente e já abre a sessão. */
export async function cadastrarCliente(input) {
    const parsed = cadastroSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, message: "Verifique os campos destacados.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }
    const { nome, email, telefone, senha } = parsed.data;
    if (await findUserByEmail(email)) {
        return { ok: false, message: "Já existe uma conta com este e-mail.", fieldErrors: { email: ["E-mail já cadastrado."] } };
    }
    insertUser({
        id: `u-client-${crypto.randomUUID().slice(0, 8)}`,
        name: nome,
        email,
        role: "client",
        telefone,
        passwordHash: await bcrypt.hash(senha, 10),
    });
    try {
        await signIn("credentials", { email, password: senha, redirectTo: "/portal/client" });
    }
    catch (error) {
        if (error instanceof AuthError) {
            return { ok: false, message: "Conta criada, mas não foi possível entrar. Use a tela de login." };
        }
        throw error; // o redirect de sucesso também é lançado como exceção
    }
    return { ok: true, message: "Conta criada! Bem-vindo(a)." };
}
