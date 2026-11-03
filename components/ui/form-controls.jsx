import { cn } from "@/lib/cn";
const control = "block w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-charcoal placeholder:text-muted/70 " +
    "transition-colors focus:border-sand-dark focus:outline-none focus:ring-2 focus:ring-sand/40 " +
    "aria-invalid:border-danger aria-invalid:focus:ring-danger/20 disabled:bg-offwhite disabled:text-muted";
/** Rótulo + controle + mensagem de erro, com ids previsíveis para aria-describedby. */
export function Field({ label, htmlFor, error, hint, required, className, children }) {
    return (<div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-charcoal">
        {label}
        {required && (<span className="ml-0.5 text-sand-dark" aria-hidden>
            *
          </span>)}
      </label>
      {children}
      {hint && !error && (<p id={`${htmlFor}-hint`} className="text-xs text-muted">
          {hint}
        </p>)}
      {error && (<p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>)}
    </div>);
}
/** Props de acessibilidade para ligar um controle à mensagem de erro do `Field`. */
export function a11y(id, error, hint) {
    return {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
    };
}
export function Input({ className, ...props }) {
    return <input className={cn(control, "h-11", className)} {...props}/>;
}
export function Select({ className, ...props }) {
    return <select className={cn(control, "h-11 appearance-none bg-[length:16px] pr-9", "select-chevron", className)} {...props}/>;
}
export function Textarea({ className, ...props }) {
    return <textarea className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...props}/>;
}
