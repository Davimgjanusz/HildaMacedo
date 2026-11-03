import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/validations/auth";
import { findUserByEmail } from "@/lib/data/portal";
export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: { email: {}, password: {} },
            async authorize(raw) {
                const parsed = loginSchema.safeParse(raw);
                if (!parsed.success)
                    return null;
                const user = await findUserByEmail(parsed.data.email);
                if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash)))
                    return null;
                return { id: user.id, name: user.name, email: user.email, role: user.role };
            },
        }),
    ],
});
