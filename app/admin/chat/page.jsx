import { ChatCenter } from "@/components/dashboard/chat-center";
import { PageHeader } from "@/components/ui/primitives";
import { getThreads } from "@/lib/data/portal";
export const metadata = { title: "Atendimento" };
export default async function ChatPage() {
    const threads = await getThreads();
    return (<>
      <PageHeader eyebrow="Atendimento" title="Central de mensagens" description="Conversas com inquilinos e clientes."/>
      <ChatCenter threads={threads}/>
    </>);
}
