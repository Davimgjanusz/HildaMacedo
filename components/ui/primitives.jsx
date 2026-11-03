import { cn } from "@/lib/cn";
export function Card({ className, ...props }) {
    return <div className={cn("rounded-2xl border border-line bg-surface", className)} {...props}/>;
}
export function CardHeader({ title, description, action, className, }) {
    return (<div className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6", className)}>
      <div>
        <h2 className="font-serif text-lg">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>);
}
const tones = {
    neutral: "bg-offwhite text-muted ring-line",
    sand: "bg-sand-light/60 text-sand-dark ring-sand/40",
    success: "bg-success/10 text-success ring-success/25",
    warning: "bg-warning/10 text-warning ring-warning/25",
    danger: "bg-danger/10 text-danger ring-danger/25",
    dark: "bg-charcoal text-white ring-charcoal",
};
export function Badge({ tone = "neutral", className, ...props }) {
    return (<span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone], className)} {...props}/>);
}
export function PageHeader({ eyebrow, title, description, action, }) {
    return (<header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{description}</p>}
      </div>
      {action}
    </header>);
}
export function StatCard({ label, value, detail, icon: Icon, tone = "neutral", }) {
    const iconTone = {
        neutral: "bg-sand-light/60 text-sand-dark",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        danger: "bg-danger/10 text-danger",
    }[tone];
    return (<Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        <span className={cn("grid size-9 place-items-center rounded-full", iconTone)}>
          <Icon className="size-4" aria-hidden/>
        </span>
      </div>
      <p className="font-sans text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {detail && <div className="text-xs text-muted">{detail}</div>}
    </Card>);
}
export function EmptyState({ icon: Icon, title, description, action }) {
    return (<div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-sand-light/60 text-sand-dark">
        <Icon className="size-5" aria-hidden/>
      </span>
      <h3 className="font-serif text-lg">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>);
}
export function Skeleton({ className }) {
    return <div className={cn("animate-pulse rounded-lg bg-line/70", className)} aria-hidden/>;
}
