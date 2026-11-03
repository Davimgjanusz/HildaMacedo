import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
const variants = {
    primary: "bg-charcoal text-white hover:bg-black",
    secondary: "bg-sand text-charcoal hover:bg-sand-dark hover:text-white",
    outline: "border border-charcoal/20 bg-transparent text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white",
    // Para fundos escuros (ex.: cabeçalho sobre a foto). Não misturar com `outline`.
    outlineLight: "border border-white/50 bg-transparent text-white hover:border-white hover:bg-white hover:text-charcoal",
    ghost: "bg-transparent text-charcoal hover:bg-sand-light/60",
    danger: "bg-danger text-white hover:bg-danger/90",
};
const sizes = {
    sm: "h-9 px-3 text-sm gap-1.5",
    md: "h-11 px-5 text-sm gap-2",
    lg: "h-13 px-7 text-base gap-2",
    icon: "h-10 w-10 justify-center",
};
/** Classes do botão — reutilizáveis em `<Link>` para manter a mesma aparência. */
export function buttonClasses(variant = "primary", size = "md", className) {
    return cn("inline-flex shrink-0 items-center justify-center rounded-full font-medium tracking-wide transition-colors duration-200", "disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className);
}
export function Button({ variant, size, loading, className, children, disabled, type = "button", ...props }) {
    return (<button type={type} className={buttonClasses(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden/>}
      {children}
    </button>);
}
