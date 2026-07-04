"use client";

// Reusable form field primitives for the Section Settings drawer. Presentation
// only — no schema/validation/export logic lives here.

import type { ReactNode } from "react";

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-faint">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-lg bg-panel px-3 py-2 text-[13.5px] text-ink outline-none focus:ring-1 focus:ring-accent";

export function TextField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <FieldRow label={label}><input {...props} className={inputCls} /></FieldRow>;
}

export function TextAreaField({ label, rows = 3, ...props }: { label: string; rows?: number } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <FieldRow label={label}><textarea rows={rows} {...props} className={`${inputCls} leading-relaxed`} /></FieldRow>;
}

export function SelectField<T extends string>({ label, value, options, onChange, labels }: {
  label: string; value: T | undefined; options: readonly T[]; onChange: (v: T) => void; labels?: Partial<Record<T, string>>;
}) {
  return (
    <FieldRow label={label}>
      <select value={value ?? options[0]} onChange={(e) => onChange(e.target.value as T)} className={`${inputCls} bg-surface capitalize`}>
        {options.map((o) => <option key={o} value={o}>{labels?.[o] ?? o}</option>)}
      </select>
    </FieldRow>
  );
}

/** Segmented single-choice control (alignment, spacing, columns…). */
export function SegmentField<T extends string | number>({ label, value, options, onChange, render }: {
  label: string; value: T | undefined; options: readonly T[]; onChange: (v: T) => void; render?: (o: T) => ReactNode;
}) {
  return (
    <FieldRow label={label}>
      <div className="flex flex-wrap gap-1 rounded-lg bg-panel p-1">
        {options.map((o) => (
          <button key={String(o)} type="button" onClick={() => onChange(o)}
            className={`min-w-9 flex-1 rounded-md px-2 py-1.5 text-[12px] font-medium capitalize transition-colors ${value === o ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-body"}`}>
            {render ? render(o) : String(o)}
          </button>
        ))}
      </div>
    </FieldRow>
  );
}

export function SwitchField({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between rounded-lg border border-line px-3 py-2.5 text-left hover:border-line-strong">
      <span><span className="block text-[13px] font-medium text-ink">{label}</span>{hint && <span className="block text-[11.5px] text-faint">{hint}</span>}</span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-line"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}
