// Small presentational helpers shared across Flowfreak module pages so each page
// stays declarative. These are layout primitives only — no data or logic.

import type { ReactNode } from "react";

/** A titled content panel (card with a heading + optional action). */
export function Panel({ title, subtitle, action, children, className = "" }: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-[14px] font-semibold text-ink">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[12.5px] text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Dashed "coming in a later phase" area — marks intentionally-unbuilt UI. */
export function Placeholder({ label, hint, className = "" }: { label: string; hint?: string; className?: string }) {
  return (
    <div className={`grid place-items-center rounded-xl border border-dashed border-line bg-panel/40 px-6 py-10 text-center ${className}`}>
      <div>
        <p className="text-[13px] font-medium text-body">{label}</p>
        {hint && <p className="mt-1 text-[12px] text-faint">{hint}</p>}
      </div>
    </div>
  );
}

/** Labelled form field wrapper. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-body">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-faint focus:border-accent";

/** Read-only chips group (e.g. tags). */
export function Chips({ items, tone = "muted" }: { items: string[]; tone?: "muted" | "success" | "brand" }) {
  const cls =
    tone === "success" ? "border-success/25 bg-success-soft text-success"
    : tone === "brand" ? "border-brand-purple/25 bg-accent-soft text-brand-purple"
    : "border-line bg-panel text-muted";
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className={`rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium ${cls}`}>{t}</span>
      ))}
    </div>
  );
}
