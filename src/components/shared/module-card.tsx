import Link from "next/link";
import type { ProductModule } from "@/types/flowfreak";

const ACCENT: Record<ProductModule["accent"], string> = {
  blue: "text-brand-blue",
  pink: "text-brand-pink",
  purple: "text-brand-purple",
  orange: "text-brand-orange",
};
const DOT: Record<ProductModule["accent"], string> = {
  blue: "bg-brand-blue",
  pink: "bg-brand-pink",
  purple: "bg-brand-purple",
  orange: "bg-brand-orange",
};
const STATUS: Record<ProductModule["status"], string> = {
  live: "border-success/25 bg-success-soft text-success",
  beta: "border-brand-purple/25 bg-accent-soft text-brand-purple",
  planned: "border-line bg-panel text-muted",
};

/** A Flowfreak product module tile — links into the module. */
export function ModuleCard({ module, icon }: { module: ProductModule; icon?: React.ReactNode }) {
  return (
    <Link
      href={module.href}
      className="card group flex h-full flex-col p-5 transition-colors hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-xl bg-panel ${ACCENT[module.accent]}`}>
          {icon ?? <span className={`h-2 w-2 rounded-full ${DOT[module.accent]}`} />}
        </span>
        <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide ${STATUS[module.status]}`}>
          {module.status}
        </span>
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-ink group-hover:text-accent">{module.name}</h3>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{module.description}</p>
    </Link>
  );
}
