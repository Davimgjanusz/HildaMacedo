import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
export function SiteFooter() {
    return (<footer className="bg-charcoal text-white/70">
      <div className="container-page grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo inverted/>
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            Curadoria de imóveis de alto padrão, intermediação de vendas e administração completa de locações, com
            atendimento próximo do primeiro contato à entrega das chaves.
          </p>
          <p className="mt-6 text-xs text-white/40">CRECI-SP 00000-J</p>
        </div>

        <nav aria-label="Links do rodapé">
          <h2 className="eyebrow mb-4 font-sans !text-sand">Navegação</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-white" href="/imoveis?finalidade=venda">Imóveis à venda</Link></li>
            <li><Link className="hover:text-white" href="/imoveis?finalidade=locacao">Imóveis para alugar</Link></li>
            <li><Link className="hover:text-white" href="/login">Portal do inquilino</Link></li>
            <li><Link className="hover:text-white" href="/login">Entrar</Link></li>
            <li><Link className="hover:text-white" href="/cadastro">Cadastrar</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow mb-4 font-sans !text-sand">Contato</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-sand" aria-hidden/>Rua Exemplo, 1000 — Jardins, São Paulo/SP</li>
            <li className="flex gap-2.5"><Phone className="mt-0.5 size-4 shrink-0 text-sand" aria-hidden/><a className="hover:text-white" href="tel:+551100000000">(11) 0000-0000</a></li>
            <li className="flex gap-2.5"><Mail className="mt-0.5 size-4 shrink-0 text-sand" aria-hidden/><a className="hover:text-white" href="mailto:contato@hildamacedo.com.br">contato@hildamacedo.com.br</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-page py-6 text-xs text-white/40">
          © Hilda Macedo Imóveis. Todos os direitos reservados.
        </p>
      </div>
    </footer>);
}
