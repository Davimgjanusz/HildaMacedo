# Spec Oficial: Plataforma Hilda Macedo Imóveis

Este documento serve como especificação técnica detalhada e guia de implementação para o desenvolvimento da plataforma **Hilda Macedo Imóveis**, estruturada com padrões de mercado de alto nível, estética minimalista de luxo e arquitetura escalável.

---

## 1. Visão Geral e Identidade Visual

A plataforma une uma **Landing Page institucional e de conversão** a um ecossistema transacional com **três portais distintos** (Admin, Inquilinos e Clientes).

### Tokens de Cores (`tailwind.config.js`)
* **Primary / Sand (Bege Sofisticado):** `#C4B49F` (Usado em detalhes do logo, ícones, bordas sutis e botões secundários).
* **Text / Deep Charcoal (Preto Absoluto):** `#1A1A1A` (Usado em tipografias de alto impacto e títulos).
* **Background / Off-White:** `#F9F8F6` (Fundo principal para transmitir aconchego e requinte).
* **Surface / Pure White:** `#FFFFFF` (Cards, modais e containers).

### Tipografia
* **Headings / Títulos:** `Playfair Display` ou `Cormorant Garamond` (Serifada clássica de luxo).
* **Corpo / Interfaces:** `Inter` ou `Geist` (Sans-serif limpa e moderna).

---

## 2. Stack Tecnológica & Dependências

* **Framework:** Next.js (App Router)
* **Linguagem:** JavaScript / TypeScript
* **Estilização:** Tailwind CSS + Lucide Icons
* **Validação de Formulários:** Zod + React Hook Form
* **Notificações:** React Toastify (`https://github.com/ebubekirtabak/react-toastfy`)
* **Efeitos Dinâmicos:** Typed.js (Hero Section)
* **Integrações de Pagamento:** API Santander (Emissão de boletos, Pix e conciliação bancária)
* **Autenticação:** NextAuth.js / Clerk (Proteção de rotas por perfis: Admin, Inquilino, Cliente)

---

## 3. Estrutura de Rotas e Arquitetura (Next.js App Router)

```text
app/
├── (public)/                       # Landing Page & Vitrine Pública
│   ├── page.jsx                    # Home (Hero com Typed.js, busca rápida, destaques)
│   ├── imoveis/                    # Listagem com filtros avançados (Venda / Locação)
│   └── imovel/[id]/                # Detalhes do imóvel, galeria e plantas
├── admin/                          # Painel Administrativo (RBAC Restrito)
│   ├── dashboard/                  # Métricas (VGV, ocupação, inadimplência)
│   ├── imoveis/                    # CRUD de imóveis, imagens e plantas
│   ├── contratos/                  # Controle de validades e seguros
│   ├── financeiro/                 # Gestão de boletos e Santander API
│   └── chat/                       # Central de atendimento interna
└── portal/
    ├── tenant/                     # Área do Inquilino
    │   ├── page.jsx                # Visão geral financeira e vencimentos
    │   ├── boletos/                # 2ª via de boleto e Pix Copia e Cola
    │   └── chamados/               # Suporte e manutenção
    └── client/                     # Área do Cliente Interessado
        ├── page.jsx                # Imóveis favoritos e histórico
        └── visitas/                # Agendamento de visitas online
```

---

## 4. Requisitos de Responsividade (Mobile-First)

* **Breakpoints do Tailwind:** `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).
* **Dashboards (Admin/Portais):**
  * Em telas menores (`< 1024px`), a barra lateral (*sidebar*) deve se transformar em um menu gaveta (*drawer*) acionado por botão hambúrguer.
  * Tabelas de dados devem conter scroll horizontal fluido (`overflow-x-auto`) ou transformar linhas em cartões empilhados em resoluções mobile.
* **Landing Page:**
  * Imagens de fundo da *Hero Section* com comportamento responsivo (`object-cover`).
  * Barra de busca flutuante adaptável (empilhando os campos de filtro em telas verticais).

---

## 5. Diretrizes de Execução para o Desenvolvedor (Claude)

1. **Modularização:** Criar componentes reutilizáveis em `/components/ui/` e `/components/public/`.
2. **Tratamento de Erros:** Utilizar o Zod para validação rigorosa de formulários de login, cadastro de imóveis e chamados de manutenção, exibindo feedback visual via React Toastify.
3. **Segurança:** Assegurar que as rotas `/admin/*` e `/portal/*` verifiquem o token de autenticação e o nível de permissão do usuário no servidor antes de renderizar qualquer conteúdo sensível.
4. **Boas Práticas:** Manter o código limpo, semântico e com suporte completo a acessibilidade (ARIA labels onde aplicável).