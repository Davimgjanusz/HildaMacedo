/**
 * Configuração compartilhada e leve (sem acesso a dados), usada pelo `proxy.ts`
 * para ler o JWT da sessão. Os providers ficam em `auth.ts`.
 */
export const authConfig = {
    session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
    pages: { signIn: "/login" },
    providers: [],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
            return session;
        },
    },
};
