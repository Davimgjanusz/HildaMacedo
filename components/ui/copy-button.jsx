"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "./button";
export function CopyButton({ value, label, successMessage }) {
    const [copied, setCopied] = useState(false);
    async function copy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success(successMessage);
            setTimeout(() => setCopied(false), 2500);
        }
        catch {
            toast.error("Não foi possível copiar. Selecione o código e copie manualmente.");
        }
    }
    return (<Button variant="outline" size="sm" onClick={copy} aria-label={label}>
      {copied ? <Check className="size-4" aria-hidden/> : <Copy className="size-4" aria-hidden/>}
      {copied ? "Copiado" : "Copiar"}
    </Button>);
}
