import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Logo oficial (PNG com fundo transparente em `public/logo-hilda-macedo.png`).
 * No estado `inverted` (fundo escuro) a imagem vira branca com um filtro CSS,
 * já que a arte original é preta.
 */
export function Logo({ inverted = false, className }) {
  return (
    <Link href="/" className={cn("group inline-flex shrink-0 items-center", className)} aria-label="Hilda Macedo Imóveis — página inicial">
      <Image
        src="/logo-hilda-macedo.png"
        alt="Hilda Macedo Imóveis"
        width={836}
        height={298}
        priority
        className={cn("h-12 w-auto transition duration-300", inverted && "brightness-0 invert")}
      />
    </Link>
  );
}
