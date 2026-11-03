"use client";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "./button";
export function ErrorView({ error, retry }) {
    useEffect(() => {
        console.error(error);
    }, [error]);
    return (<div role="alert" className="flex flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="size-5" aria-hidden/>
      </span>
      <h2 className="text-2xl">Algo não saiu como esperado</h2>
      <p className="max-w-md text-sm text-muted">Não foi possível carregar esta página. Tente novamente em instantes.</p>
      <Button variant="outline" onClick={() => retry()}>
        <RotateCcw className="size-4" aria-hidden/>
        Tentar novamente
      </Button>
    </div>);
}
