import { Inter, Playfair_Display } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";
const playfair = Playfair_Display({
    variable: "--font-playfair",
    subsets: ["latin"],
    display: "swap",
});
const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});
export const metadata = {
    title: {
        default: "Hilda Macedo Imóveis",
        template: "%s | Hilda Macedo Imóveis",
    },
    description: "Imóveis de alto padrão para venda e locação, com atendimento personalizado e gestão completa de contratos.",
};
export default function RootLayout({ children }) {
    return (<html lang="pt-BR" className={`${playfair.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {children}
        <ToastProvider />
      </body>
    </html>);
}
