"use client";

import { useSyncExternalStore, useState, type ReactNode } from "react";
import { briefStore } from "@/lib/brief/store";
import type { Brief, BriefStatus } from "@/lib/brief/types";

/* ── Store hooks ── */
export function useBriefs(): Brief[] {
  return useSyncExternalStore(briefStore.subscribe, briefStore.list, briefStore.serverList);
}
export function useBrief(id: string): Brief | undefined {
  const get = () => briefStore.get(id);
  const server = () => undefined;
  return useSyncExternalStore(briefStore.subscribe, get, server);
}

/* ── Status ── */
const STATUS: Record<BriefStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-panel text-muted" },
  "in-review": { label: "In review", cls: "bg-warning-soft text-warning" },
  ready: { label: "Ready", cls: "bg-success-soft text-success" },
  exported: { label: "Exported", cls: "bg-accent-soft text-accent" },
};
export function StatusBadge({ status }: { status: BriefStatus }) {
  const s = STATUS[status];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>;
}

/* ── Score visuals ── */
export function scoreColor(v: number): string {
  if (v >= 80) return "var(--color-success)";
  if (v >= 55) return "var(--color-warning)";
  return "var(--color-accent)";
}
export function ScoreRing({ value, size = 56, stroke = 6 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-panel)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={scoreColor(value)} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-ink font-bold" style={{ fontSize: size * 0.28 }}>{value}</text>
    </svg>
  );
}
export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="text-body">{label}</span>
        <span className="font-semibold text-ink">{value}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: scoreColor(value) }} />
      </div>
    </div>
  );
}

/* ── Layout primitives ── */
export function SectionCard({ title, action, children, className = "" }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-surface p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="text-[15px] font-semibold text-ink">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-1 text-[14px] leading-relaxed text-body">{value || <span className="text-faint">—</span>}</dd>
    </div>
  );
}

export function Chips({ items, tone = "panel" }: { items: string[]; tone?: "panel" | "accent" | "success" }) {
  const cls = tone === "accent" ? "bg-accent-soft text-accent" : tone === "success" ? "bg-success-soft text-success" : "bg-panel text-body";
  if (!items?.length) return <span className="text-[13px] text-faint">None captured yet</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => <span key={t} className={`rounded-full px-2.5 py-1 text-[12.5px] font-medium ${cls}`}>{t}</span>)}
    </div>
  );
}

export function BulletList({ items, empty = "None" }: { items: string[]; empty?: string }) {
  if (!items?.length) return <p className="text-[13px] text-faint">{empty}</p>;
  return (
    <ul className="space-y-2">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-body">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
          {t}
        </li>
      ))}
    </ul>
  );
}

/* ── Copy / download ── */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); } catch {} }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-body transition-colors hover:text-ink"
    >
      {done ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="var(--color-success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.7" /></svg>
      )}
      {done ? "Copied" : label}
    </button>
  );
}

export function downloadFile(name: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Template icons ── */
export const TEMPLATE_ICONS: Record<string, ReactNode> = {
  car: <path d="M5 16.5V13l1.6-4a2 2 0 0 1 1.9-1.3h7A2 2 0 0 1 17.4 9L19 13v3.5M5 16.5h14M5 16.5v2m14-2v2M7.5 13h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  layers: <path d="M12 4l8 4-8 4-8-4 8-4Zm8 8-8 4-8-4m16 4-8 4-8-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  heart: <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  hammer: <path d="M14 7l3 3m-1.5-1.5 4-4a2 2 0 0 1 3 3l-4 4m-4.5.5L6 20l-2-2 7.5-7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  sparkle: <path d="M12 4l1.8 4.7L18.5 10l-4.7 1.8L12 16l-1.8-4.2L5.5 10l4.7-1.3L12 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6" /></>,
  cloud: <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6 1.5A3.5 3.5 0 0 1 17 18H7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  cart: <path d="M5 5h2l1.5 10h9L19 8H7m1.5 12a1 1 0 1 0 0 .01M17 20a1 1 0 1 0 0 .01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  utensils: <path d="M6 3v7a2 2 0 0 0 2 2m0-9v18M8 12v9m10-18v18m0-9c1.7 0 3-1.8 3-4s-1.3-5-3-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
};
export const TemplateIcon = ({ icon }: { icon: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{TEMPLATE_ICONS[icon] ?? TEMPLATE_ICONS.briefcase}</svg>
);
