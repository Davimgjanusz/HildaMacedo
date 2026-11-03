"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";
import { toggleFavorite } from "@/app/actions/public";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
export function FavoriteButton({ imovelId, initial }) {
    const router = useRouter();
    const [favorito, setFavorito] = useState(initial);
    const [pending, startTransition] = useTransition();
    function onClick() {
        startTransition(async () => {
            const result = await toggleFavorite(imovelId);
            if (result.needsLogin) {
                toast.info(result.message);
                router.push(`/login?callbackUrl=${encodeURIComponent(`/imovel/${imovelId}`)}`);
                return;
            }
            if (!result.ok) {
                toast.error(result.message);
                return;
            }
            setFavorito(Boolean(result.favorito));
            toast.success(result.message);
        });
    }
    return (<Button variant="outline" onClick={onClick} loading={pending} aria-pressed={favorito} className="w-full">
      {!pending && <Heart className={cn("size-4", favorito && "fill-danger text-danger")} aria-hidden/>}
      {favorito ? "Salvo nos favoritos" : "Salvar nos favoritos"}
    </Button>);
}
