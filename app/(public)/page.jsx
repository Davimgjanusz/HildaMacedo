import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, FileCheck2, KeyRound, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { TypedText } from "@/components/public/typed-text";
import { SearchBar } from "@/components/public/search-bar";
import { PropertyCard } from "@/components/public/property-card";
import { ContactForm } from "@/components/public/contact-form";
import { buttonClasses } from "@/components/ui/button";
import { getFeaturedProperties } from "@/lib/data/properties";
const HERO_IMAGE = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2400&q=80";
const ABOUT_IMAGE = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80";
const TYPED = ["seu novo lar.", "o investimento certo.", "a vista dos seus sonhos.", "um endereço exclusivo."];
const SERVICOS = [
    {
        icon: KeyRound,
        titulo: "Venda",
        texto: "Curadoria de imóveis de alto padrão, avaliação de mercado e assessoria jurídica até a escritura.",
    },
    {
        icon: Building2,
        titulo: "Locação",
        texto: "Seleção criteriosa de inquilinos, análise de crédito e contratos com garantias sólidas.",
    },
    {
        icon: FileCheck2,
        titulo: "Administração",
        texto: "Cobrança via boleto e Pix, repasses, reajustes, seguros e manutenção — tudo acompanhado online.",
    },
];
export default function HomePage() {
    return (<>
      {/* Hero */}
      <section className="relative isolate flex min-h-[100svh] items-end pb-10 pt-28 sm:pb-16 lg:items-center lg:pb-0">
        <Image src={HERO_IMAGE} alt="Fachada de residência contemporânea com piscina ao entardecer" fill priority quality={85} sizes="100vw" className="-z-10 object-cover"/>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/35 to-black/75" aria-hidden/>

        <div className="container-page">
          <div className="max-w-3xl animate-fade-up">
            <p className="eyebrow mb-5 !text-sand">Imóveis de alto padrão · São Paulo</p>
            <h1 className="text-4xl leading-[1.1] text-white sm:text-6xl lg:text-7xl">
              Encontre <br className="hidden sm:block"/>
              <TypedText strings={TYPED}/>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Atendimento personalizado para comprar, alugar ou confiar a administração do seu imóvel a quem entende de
              exclusividade.
            </p>
          </div>
          <SearchBar className="mt-10 lg:mt-14"/>
        </div>
      </section>

      {/* Destaques */}
      <section className="container-page py-20 sm:py-28" aria-labelledby="destaques-titulo">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3">Seleção da semana</p>
            <h2 id="destaques-titulo" className="text-3xl sm:text-5xl">Imóveis em destaque</h2>
          </div>
          <Link href="/imoveis" className="group inline-flex items-center gap-2 text-sm font-medium">
            Ver todos os imóveis
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden/>
          </Link>
        </div>
        <FeaturedGrid />
      </section>

      {/* Serviços */}
      <section id="servicos" className="scroll-mt-20 border-y border-line bg-surface py-20 sm:py-28" aria-labelledby="servicos-titulo">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mb-3">O que fazemos</p>
            <h2 id="servicos-titulo" className="text-3xl sm:text-5xl">Uma assessoria completa</h2>
          </div>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3">
            {SERVICOS.map(({ icon: Icon, titulo, texto }) => (<li key={titulo} className="flex flex-col gap-4 bg-surface p-8 sm:p-10">
                <Icon className="size-7 text-sand-dark" strokeWidth={1.4} aria-hidden/>
                <h3 className="text-2xl">{titulo}</h3>
                <p className="text-sm leading-relaxed text-muted">{texto}</p>
              </li>))}
          </ul>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="container-page scroll-mt-20 py-20 sm:py-28" aria-labelledby="sobre-titulo">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image src={ABOUT_IMAGE} alt="Sala de estar com décor sofisticado e luz natural" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover"/>
          </div>
          <div>
            <p className="eyebrow mb-3">Sobre</p>
            <h2 id="sobre-titulo" className="text-3xl sm:text-5xl">Hilda Macedo Imóveis</h2>
            <div className="mt-6 space-y-4 leading-relaxed text-muted">
              <p>
                Acreditamos que cada imóvel tem uma história e que cada cliente merece atenção individual. Por isso
                trabalhamos com uma carteira enxuta e selecionada, em que conhecemos cada endereço de perto.
              </p>
              <p>
                Da primeira visita à entrega das chaves — e durante toda a locação — você conta com uma equipe dedicada e
                com portais digitais para acompanhar contratos, boletos e solicitações.
              </p>
            </div>
            <ul className="mt-8 space-y-3 text-sm">
              {["Atendimento consultivo e discreto", "Documentação revisada por assessoria jurídica", "Portais online para inquilinos e clientes"].map((item) => (<li key={item} className="flex items-center gap-3">
                  <ShieldCheck className="size-5 text-sand-dark" aria-hidden/>
                  {item}
                </li>))}
            </ul>
          </div>
        </div>
      </section>

      {/* Portal */}
      <section className="bg-charcoal py-16 text-white sm:py-20">
        <div className="container-page flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="eyebrow mb-3 !text-sand">Portal do inquilino</p>
            <h2 className="text-3xl sm:text-4xl">2ª via de boleto, Pix e chamados em um só lugar.</h2>
          </div>
          <Link href="/login" className={buttonClasses("secondary", "lg")}>
            Acessar portal
            <ArrowRight className="size-4" aria-hidden/>
          </Link>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="container-page scroll-mt-20 py-20 sm:py-28" aria-labelledby="contato-titulo">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-3">Contato</p>
            <h2 id="contato-titulo" className="text-3xl sm:text-5xl">Vamos conversar?</h2>
            <p className="mt-5 leading-relaxed text-muted">
              Conte o que você procura e um de nossos consultores retornará em até um dia útil.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex gap-3"><MapPin className="size-5 shrink-0 text-sand-dark" aria-hidden/>Rua Exemplo, 1000 — Jardins, São Paulo/SP</li>
              <li className="flex gap-3"><Phone className="size-5 shrink-0 text-sand-dark" aria-hidden/><a href="tel:+551100000000" className="hover:underline">(11) 0000-0000</a></li>
              <li className="flex gap-3"><Mail className="size-5 shrink-0 text-sand-dark" aria-hidden/><a href="mailto:contato@hildamacedo.com.br" className="hover:underline">contato@hildamacedo.com.br</a></li>
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-10">
            <ContactForm />
          </div>
        </div>
      </section>
    </>);
}
async function FeaturedGrid() {
    const featured = await getFeaturedProperties(6);
    return (<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((property) => (<PropertyCard key={property.id} property={property}/>))}
    </div>);
}
