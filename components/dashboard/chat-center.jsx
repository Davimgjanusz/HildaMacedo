"use client";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { ArrowLeft, MessagesSquare, Send } from "lucide-react";
import { toast } from "react-toastify";
import { readThread, sendMessage } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { messageSchema } from "@/lib/validations/portal";
const PAPEL = { tenant: "Inquilino", client: "Cliente", admin: "Equipe" };
export function ChatCenter({ threads }) {
    const [selectedId, setSelectedId] = useState(null);
    const selected = threads.find((t) => t.id === selectedId) ?? null;
    function open(id) {
        setSelectedId(id);
        void readThread(id);
    }
    return (<div className="grid h-[calc(100svh-14rem)] min-h-[520px] overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-[320px_1fr]">
      <aside className={cn("flex min-h-0 flex-col border-r border-line", selected && "hidden md:flex")} aria-label="Conversas">
        <ul className="flex-1 divide-y divide-line overflow-y-auto">
          {threads.map((t) => {
            const last = t.mensagens.at(-1);
            return (<li key={t.id}>
                <button type="button" onClick={() => open(t.id)} aria-current={t.id === selectedId} className={cn("flex w-full flex-col gap-1 px-5 py-4 text-left transition-colors hover:bg-offwhite", t.id === selectedId && "bg-sand-light/40")}>
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{t.contatoNome}</span>
                    {t.naoLidas > 0 && t.id !== selectedId && (<span className="grid size-5 place-items-center rounded-full bg-charcoal text-[0.65rem] text-white" aria-label={`${t.naoLidas} não lidas`}>
                        {t.naoLidas}
                      </span>)}
                  </span>
                  <span className="truncate text-xs text-sand-dark">{t.assunto}</span>
                  {last && <span className="truncate text-xs text-muted">{last.texto}</span>}
                </button>
              </li>);
        })}
        </ul>
      </aside>

      <section className={cn("min-h-0 flex-col", selected ? "flex" : "hidden md:flex")} aria-label="Mensagens">
        {selected ? (<Conversation key={selected.id} thread={selected} onBack={() => setSelectedId(null)}/>) : (<div className="grid flex-1 place-items-center">
            <EmptyState icon={MessagesSquare} title="Selecione uma conversa" description="As mensagens de inquilinos e clientes aparecem aqui."/>
          </div>)}
      </section>
    </div>);
}
function Conversation({ thread, onBack }) {
    const [texto, setTexto] = useState("");
    const [pending, startTransition] = useTransition();
    const [messages, addOptimistic] = useOptimistic(thread.mensagens, (state, msg) => [...state, msg]);
    const endRef = useRef(null);
    useEffect(() => {
        endRef.current?.scrollIntoView({ block: "end" });
    }, [messages.length]);
    function submit(e) {
        e.preventDefault();
        const parsed = messageSchema.safeParse({ threadId: thread.id, texto });
        if (!parsed.success) {
            toast.error(parsed.error.issues[0]?.message ?? "Mensagem inválida.");
            return;
        }
        setTexto("");
        startTransition(async () => {
            addOptimistic({ id: `tmp-${Date.now()}`, autor: "equipe", texto: parsed.data.texto, enviadoEm: new Date().toISOString() });
            const result = await sendMessage(parsed.data);
            if (!result.ok) {
                toast.error(result.message);
                setTexto(parsed.data.texto);
            }
        });
    }
    return (<>
      <header className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-6">
        <button type="button" onClick={onBack} className="grid size-9 place-items-center rounded-full hover:bg-offwhite md:hidden" aria-label="Voltar para conversas">
          <ArrowLeft className="size-4"/>
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{thread.contatoNome}</p>
          <p className="truncate text-xs text-muted">{thread.assunto}</p>
        </div>
        <Badge tone="sand">{PAPEL[thread.contatoPapel]}</Badge>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-offwhite/60 px-4 py-5 sm:px-6" aria-live="polite">
        {messages.map((m) => (<div key={m.id} className={cn("flex", m.autor === "equipe" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[70%]", m.autor === "equipe" ? "rounded-br-sm bg-charcoal text-white" : "rounded-bl-sm bg-surface ring-1 ring-line", m.id.startsWith("tmp-") && "opacity-60")}>
              <p className="whitespace-pre-wrap">{m.texto}</p>
              <p className={cn("mt-1 text-[0.65rem]", m.autor === "equipe" ? "text-white/60" : "text-muted")}>{formatDateTime(m.enviadoEm)}</p>
            </div>
          </div>))}
        <div ref={endRef}/>
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-line p-3 sm:p-4">
        <label htmlFor="chat-texto" className="sr-only">Mensagem</label>
        <textarea id="chat-texto" rows={1} value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
            }
        }} placeholder="Escreva uma resposta…" className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-sand-dark focus:outline-none focus:ring-2 focus:ring-sand/40"/>
        <Button type="submit" size="icon" loading={pending} aria-label="Enviar mensagem">
          {!pending && <Send className="size-4"/>}
        </Button>
      </form>
    </>);
}
