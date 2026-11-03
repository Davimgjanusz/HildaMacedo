"use client";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteProperty } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
export function DeletePropertyButton({ id, titulo }) {
    const [pending, startTransition] = useTransition();
    function onClick() {
        if (!window.confirm(`Excluir "${titulo}"? Esta ação não pode ser desfeita.`))
            return;
        startTransition(async () => {
            const result = await deleteProperty(id);
            (result.ok ? toast.success : toast.error)(result.message);
        });
    }
    return (<Button variant="ghost" size="icon" onClick={onClick} loading={pending} aria-label={`Excluir ${titulo}`}>
      {!pending && <Trash2 className="size-4 text-danger"/>}
    </Button>);
}
