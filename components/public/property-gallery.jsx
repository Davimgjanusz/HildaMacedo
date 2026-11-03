"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/cn";
export function PropertyGallery({ images, title }) {
    const [active, setActive] = useState(0);
    const [open, setOpen] = useState(false);
    const dialogRef = useRef(null);
    const go = useCallback((delta) => setActive((i) => (i + delta + images.length) % images.length), [images.length]);
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog)
            return;
        if (open && !dialog.open)
            dialog.showModal();
        if (!open && dialog.open)
            dialog.close();
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => {
            if (e.key === "ArrowRight")
                go(1);
            if (e.key === "ArrowLeft")
                go(-1);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, go]);
    return (<section aria-label="Galeria de fotos">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-line sm:aspect-[16/9]">
        <Image src={images[active]} alt={`${title} — foto ${active + 1} de ${images.length}`} fill priority sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover"/>
        <button type="button" onClick={() => setOpen(true)} className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white">
          <Expand className="size-4" aria-hidden/>
          Ver {images.length} fotos
        </button>
        {images.length > 1 && (<>
            <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="absolute top-1/2 left-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 hover:bg-white">
              <ChevronLeft className="size-5"/>
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Próxima foto" className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 hover:bg-white">
              <ChevronRight className="size-5"/>
            </button>
          </>)}
      </div>

      {images.length > 1 && (<ul className="mt-3 flex gap-3 overflow-x-auto pb-1" aria-label="Miniaturas">
          {images.map((src, i) => (<li key={src + i} className="shrink-0">
              <button type="button" onClick={() => setActive(i)} aria-label={`Mostrar foto ${i + 1}`} aria-current={i === active} className={cn("relative block h-16 w-24 overflow-hidden rounded-lg ring-2 transition sm:h-20 sm:w-28", i === active ? "ring-sand-dark" : "ring-transparent opacity-70 hover:opacity-100")}>
                <Image src={src} alt="" fill sizes="112px" className="object-cover"/>
              </button>
            </li>))}
        </ul>)}

      <dialog ref={dialogRef} onClose={() => setOpen(false)} aria-label={`Fotos de ${title}`} className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 backdrop:bg-black/80">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80">
            <span aria-live="polite">
              {active + 1} / {images.length}
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar galeria" className="grid size-10 place-items-center rounded-full hover:bg-white/10">
              <X className="size-5 text-white"/>
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={images[active]} alt={`${title} — foto ${active + 1}`} fill sizes="100vw" className="object-contain"/>
            <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="absolute top-1/2 left-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <ChevronLeft className="size-6"/>
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Próxima foto" className="absolute top-1/2 right-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <ChevronRight className="size-6"/>
            </button>
          </div>
        </div>
      </dialog>
    </section>);
}
