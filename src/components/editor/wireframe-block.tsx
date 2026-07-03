"use client";

// Low-fidelity wireframe renderers. Each section type draws a realistic (but
// grey/placeholder) website layout so the Wireframe canvas looks like a real
// page, not a list of cards. Nothing is forced — only sections present in the
// canvas state render, but each renders with a layout that matches its type.

// Section kind + inference live in the pure lib module so server generators can
// share them; re-exported here for the wireframe renderer's convenience.
export { sectionKind, type SectionKind } from "@/lib/sections";
import { sectionKind, type SectionKind } from "@/lib/sections";

const bar = (w: string, h = "h-2.5", extra = "") => <div className={`${h} ${w} rounded bg-line ${extra}`} />;
/** Grey placeholder box. Accepts an optional key for list rendering. */
function box(extra: string, key?: number) {
  return <div key={key} className={`rounded-md bg-line/70 ${extra}`} />;
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3">{children}</div>;
}

// Guaranteed minimum height per section type so a block can never collapse
// (which would let it visually run into the next one). Real document flow.
const MIN_H: Record<string, string> = {
  navbar: "min-h-[56px]", hero: "min-h-[240px]", features: "min-h-[220px]",
  services: "min-h-[240px]", form: "min-h-[220px]", pricing: "min-h-[260px]",
  faq: "min-h-[200px]", testimonials: "min-h-[220px]", gallery: "min-h-[200px]",
  cta: "min-h-[180px]", footer: "min-h-[160px]", directory: "min-h-[240px]",
  dashboard: "min-h-[240px]", generic: "min-h-[180px]",
};

/** Render a section's low-fi wireframe. Wrapped in a full-width, min-height
 *  block so sections always stack cleanly in the page column. */
export function SectionWireframe({ name, mobile }: { name: string; mobile?: boolean }) {
  const kind = sectionKind(name);
  return <div className={`w-full ${MIN_H[kind] ?? "min-h-[160px]"}`}>{renderKind(kind, mobile)}</div>;
}

function renderKind(kind: SectionKind, mobile?: boolean): React.ReactElement {
  const cols = mobile ? 1 : 3;

  switch (kind) {
    case "navbar":
      return (
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          {box("h-6 w-20")}
          <div className="hidden items-center gap-4 sm:flex">
            {bar("w-12")}{bar("w-12")}{bar("w-12")}{bar("w-12")}
          </div>
          <div className="h-7 w-20 rounded-md bg-accent/25" />
        </div>
      );

    case "hero":
      return (
        <div className={`grid items-center gap-6 px-8 py-12 ${mobile ? "" : "grid-cols-2"}`}>
          <div className="flex flex-col gap-3">
            {bar("w-3/4", "h-5")}
            {bar("w-2/3", "h-5")}
            {bar("w-full")}
            {bar("w-5/6")}
            <div className="mt-2 flex gap-3">
              <div className="h-8 w-28 rounded-md bg-accent/30" />
              <div className="h-8 w-24 rounded-md border border-line" />
            </div>
          </div>
          {box("h-40 w-full")}
        </div>
      );

    case "features":
    case "services":
      return (
        <div className="flex flex-col items-center gap-5 px-8 py-10">
          {bar("w-52", "h-4")}
          {bar("w-72")}
          <div className={`grid w-full gap-4 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
            {Array.from({ length: cols }).map((_, i) => (
              <Card key={i}>
                <div className="h-8 w-8 rounded-full bg-line/70" />
                {bar("w-2/3")}
                {bar("w-full", "h-2")}
                {bar("w-5/6", "h-2")}
              </Card>
            ))}
          </div>
        </div>
      );

    case "form":
      return (
        <div className="mx-auto flex max-w-md flex-col gap-3 px-8 py-10">
          {bar("w-48", "h-4")}
          {box("h-9 w-full")}
          {box("h-9 w-full")}
          {box("h-20 w-full")}
          <div className="h-9 w-32 rounded-md bg-accent/30" />
        </div>
      );

    case "pricing":
      return (
        <div className="flex flex-col items-center gap-5 px-8 py-10">
          {bar("w-52", "h-4")}
          <div className={`grid w-full gap-4 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
            {Array.from({ length: cols }).map((_, i) => (
              <Card key={i}>
                {bar("w-16")}
                {bar("w-24", "h-5")}
                {bar("w-full", "h-2")}{bar("w-5/6", "h-2")}{bar("w-4/6", "h-2")}
                <div className="mt-1 h-8 w-full rounded-md bg-accent/25" />
              </Card>
            ))}
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="mx-auto flex max-w-2xl flex-col gap-2.5 px-8 py-10">
          {bar("w-40", "h-4")}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3">
              {bar("w-1/2", "h-2.5")}
              <span className="text-faint">＋</span>
            </div>
          ))}
        </div>
      );

    case "testimonials":
      return (
        <div className="flex flex-col items-center gap-5 px-8 py-10">
          {bar("w-48", "h-4")}
          <div className={`grid w-full gap-4 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
            {Array.from({ length: cols }).map((_, i) => (
              <Card key={i}>
                {bar("w-full", "h-2")}{bar("w-5/6", "h-2")}{bar("w-3/4", "h-2")}
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-line/70" />
                  {bar("w-20", "h-2")}
                </div>
              </Card>
            ))}
          </div>
        </div>
      );

    case "gallery":
      return (
        <div className={`grid gap-3 px-8 py-10 ${mobile ? "grid-cols-2" : "grid-cols-4"}`}>
          {Array.from({ length: mobile ? 4 : 8 }).map((_, i) => box("h-24 w-full", i))}
        </div>
      );

    case "cta":
      return (
        <div className="flex flex-col items-center gap-3 bg-panel px-8 py-12 text-center">
          {bar("w-2/3", "h-5", "mx-auto")}
          {bar("w-1/2", "mx-auto")}
          <div className="mt-2 h-9 w-36 rounded-md bg-accent/30" />
        </div>
      );

    case "footer":
      return (
        <div className="grid grid-cols-2 gap-6 bg-ink/90 px-8 py-10 sm:grid-cols-4">
          {Array.from({ length: mobile ? 2 : 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-2.5 w-16 rounded bg-white/40" />
              <div className="h-2 w-20 rounded bg-white/20" />
              <div className="h-2 w-14 rounded bg-white/20" />
              <div className="h-2 w-16 rounded bg-white/20" />
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="flex flex-col gap-3 px-8 py-10">
          {bar("w-48", "h-4")}
          {bar("w-full", "h-2")}{bar("w-11/12", "h-2")}{bar("w-4/5", "h-2")}
          {box("h-24 w-full")}
        </div>
      );
  }
}
