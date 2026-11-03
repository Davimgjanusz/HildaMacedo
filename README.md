# Hilda Macedo Imóveis

Landing page institucional + vitrine de imóveis + três portais protegidos (Administração, Inquilino e Cliente), conforme `especifica_o_t_cnica_do_projeto.md`.

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha AUTH_SECRET (npx auth secret)
npm run dev                  # http://localhost:3000
```

Produção local: `npm run build && npm start` (exige `AUTH_TRUST_HOST=true` fora da Vercel).

### Acessos de demonstração

| Perfil | E-mail | Senha | Área |
|---|---|---|---|
| Administração | admin@hildamacedo.com.br | admin123 | `/admin/dashboard` |
| Inquilino | inquilino@hildamacedo.com.br | inquilino123 | `/portal/tenant` |
| Cliente | cliente@hildamacedo.com.br | cliente123 | `/portal/client` |

A tela de login mostra atalhos para esses acessos; defina `HIDE_DEMO_LOGINS=true` para ocultá-los.

## Stack

Next.js 16 (App Router, Cache Components, Turbopack) · JavaScript · Tailwind CSS v4 · Lucide · Zod 4 + React Hook Form · React Toastify · Typed.js · Auth.js (NextAuth v5) · qrcode. Código em **JavaScript** (sem TypeScript).

> **Tailwind v4:** os tokens de cor e tipografia da spec ficam em `app/globals.css` (bloco `@theme`), que substitui o antigo `tailwind.config.js`. Ex.: `bg-sand`, `text-charcoal`, `bg-offwhite`, `font-serif`.

## Estrutura

```text
app/
├── (public)/            Início (Hero + Typed.js + busca), /imoveis (filtros), /imovel/[id] (galeria, plantas)
├── login/               Login com RHF + Zod
├── admin/               dashboard · imoveis (CRUD) · contratos · financeiro (Santander) · chat
├── portal/tenant/       visão geral · boletos (2ª via, Pix QR/copia e cola) · chamados
├── portal/client/       favoritos e histórico · visitas (agendamento)
├── actions/             Server Actions (todas revalidam Zod + perfil no servidor)
└── api/                 auth/[...nextauth] · webhooks/santander (conciliação)
components/ui/           Botões, campos acessíveis, DataTable responsiva, badges, toasts…
components/public/       Header, footer, hero, busca, cards, galeria, formulários públicos
components/dashboard/    Shell com sidebar/drawer, formulários e gráficos dos painéis
lib/                     auth (DAL + papéis), data (camada de dados), santander, validations, format
proxy.js                  Redirecionamento otimista por perfil (antigo middleware)
```

## Segurança (RBAC)

1. **`proxy.js`**: redireciona antes de renderizar: sem sessão vai para `/login?callbackUrl=…`, e um perfil errado vai para a própria área.
2. **Layouts protegidos** (`ProtectedLayout` → `RequireRole`): verificam sessão e perfil **no servidor** antes de renderizar qualquer conteúdo sensível; as páginas chamam `requireRole()` novamente.
3. **Server Actions** chamam `authorize()` e revalidam a entrada com o mesmo schema Zod usado no formulário.
4. `callbackUrl` só aceita caminhos internos permitidos ao perfil (sem open redirect).

## O que é simulado hoje

| Item | Situação | Para produção |
|---|---|---|
| Banco de dados | Em memória (`lib/data/store.js`); reinicia a cada deploy | Trocar os módulos de `lib/data/*` por Prisma/Drizzle mantendo as assinaturas |
| Santander | `SANTANDER_ENV=mock` gera linha digitável e Pix BR Code **válidos** (dígitos verificadores e CRC conferidos) | Preencher credenciais, certificado mTLS e workspace; **confirmar rotas e payload** em `lib/santander/client.js` no portal developer.santander.com.br |
| Webhook de conciliação | `/api/webhooks/santander` com segredo em `x-webhook-secret` | Ajustar `payloadSchema` ao formato real do banco |
| Imagens | URLs (Unsplash) e planta ilustrativa em `/public/plantas` | Upload para storage (S3, Vercel Blob…) |
| Usuários | 5 usuários fixos | Cadastro, recuperação de senha e convites |
| Dados de contato/CRECI | Placeholders no footer e na home | Dados reais da imobiliária |
