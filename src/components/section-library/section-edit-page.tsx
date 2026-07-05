"use client";

// Full-page section editor (replaces the edit popup). Large live preview with a
// device toggle on the left, the content/metadata form on the right. Saves a
// per-project override, then returns to the library.

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { createSectionTheme } from "@/components/sections/section-theme";
import type { StyleGuideCanvas } from "@/lib/canvas";
import { SectionErrorBoundary, renderLibrarySection } from "@/components/section-library/section-render";
import type { LibrarySection, LibraryContentItem } from "@/lib/section-library/manual-sections";
import { updateLibrarySectionContentAction } from "@/app/(app)/projects/[id]/editor/actions";

type Device = "desktop" | "tablet" | "mobile" | "full";
const DEVICE_WIDTH: Record<Device, number | null> = { desktop: 1280, tablet: 820, mobile: 390, full: null };
const INPUT = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-accent";

const CONTENT_FIELDS: { key: keyof LibrarySection["defaultContent"]; label: string; area?: boolean }[] = [
  { key: "eyebrow", label: "Eyebrow" },
  { key: "title", label: "Heading" },
  { key: "subtitle", label: "Subheading" },
  { key: "description", label: "Description", area: true },
  { key: "primaryButtonLabel", label: "Primary button" },
  { key: "secondaryButtonLabel", label: "Secondary button" },
];

export function SectionEditPage({
  projectId, section, style,
}: {
  projectId: string;
  section: LibrarySection;
  style?: StyleGuideCanvas | null;
}) {
  const router = useRouter();
  const theme = useMemo(() => createSectionTheme(style ?? undefined), [style]);
  const backHref = `/projects/${projectId}/references`;

  const [name, setName] = useState(section.name);
  const [description, setDescription] = useState(section.description);
  const [tags, setTags] = useState(section.tags.join(", "));
  const [content, setContent] = useState({ ...section.defaultContent });
  const [items, setItems] = useState<LibraryContentItem[]>(section.defaultContent.items ?? []);
  const [device, setDevice] = useState<Device>("desktop");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const hasItems = section.defaultContent.items !== undefined;
  const shownFields = CONTENT_FIELDS.filter((f) => section.defaultContent[f.key] !== undefined);
  const width = DEVICE_WIDTH[device];
  const previewSection: LibrarySection = { ...section, defaultContent: { ...content, items: hasItems ? items : content.items } };
  const setField = (k: keyof LibrarySection["defaultContent"], v: string) => setContent((c) => ({ ...c, [k]: v }));

  const save = (thenBack: boolean) => {
    setMsg(null);
    start(async () => {
      const res = await updateLibrarySectionContentAction(projectId, section.id, {
        name: name.trim() || section.name,
        description: description.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        defaultContent: { ...content, ...(hasItems ? { items } : {}) },
      });
      if (res.error) { setMsg(res.error); return; }
      if (thenBack) { router.push(backHref); router.refresh(); }
      else { setMsg("Saved."); router.refresh(); }
    });
  };

  return (
    <PageContainer>
      {/* Breadcrumb + actions header. */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
        <Link href={backHref} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12.5px] font-medium text-muted hover:bg-panel hover:text-ink">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Section Library
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-[18px] font-semibold text-ink">Edit “{section.name}”</h1>
          <p className="truncate text-[12.5px] text-muted">{section.category} · {section.layoutType}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {msg && <span className="text-[12.5px] text-muted">{msg}</span>}
          <Button variant="secondary" onClick={() => save(false)} disabled={pending}>Save</Button>
          <Button onClick={() => save(true)} disabled={pending}>{pending ? "Saving…" : "Save & close"}</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Live preview + device toggle. */}
        <div>
          <div className="mb-3 inline-flex items-center gap-0.5 rounded-full border border-line bg-panel p-0.5">
            {(Object.keys(DEVICE_WIDTH) as Device[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                aria-pressed={device === d}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${device === d ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="overflow-auto rounded-2xl border border-line bg-panel p-4">
            <div className="mx-auto bg-white transition-[width] duration-300" style={{ width: width ? `${width}px` : "100%", maxWidth: "100%" }}>
              <div className={width && width < 1280 ? "overflow-hidden rounded-xl border border-line shadow-sm" : ""}>
                <SectionErrorBoundary key={device}>{renderLibrarySection(previewSection, theme, device === "mobile")}</SectionErrorBoundary>
              </div>
            </div>
          </div>
        </div>

        {/* Form. */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <Field label="Display name"><input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} /></Field>
          <Field label="Card description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={INPUT} /></Field>
          <Field label="Tags (comma separated)"><input value={tags} onChange={(e) => setTags(e.target.value)} className={INPUT} /></Field>

          {shownFields.length > 0 && <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wide text-muted">Default content</p>}
          {shownFields.map((f) => (
            <Field key={f.key} label={f.label}>
              {f.area
                ? <textarea value={(content[f.key] as string) ?? ""} onChange={(e) => setField(f.key, e.target.value)} rows={2} className={INPUT} />
                : <input value={(content[f.key] as string) ?? ""} onChange={(e) => setField(f.key, e.target.value)} className={INPUT} />}
            </Field>
          ))}

          {hasItems && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Items</p>
                <button type="button" onClick={() => setItems((a) => [...a, { title: "New item", text: "" }])} className="text-[12px] font-medium text-accent hover:underline">+ Add item</button>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((it, i) => (
                  <div key={i} className="rounded-lg border border-line p-2">
                    <div className="flex items-center gap-2">
                      <input value={it.title ?? ""} onChange={(e) => setItems((a) => a.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} placeholder="Title" className={INPUT} />
                      <button type="button" onClick={() => setItems((a) => a.filter((_, j) => j !== i))} aria-label="Remove item" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-danger-soft/40 hover:text-danger">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M10 7V5h4v2m-6 0 .7 12h6.6L18 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                    <input value={it.text ?? ""} onChange={(e) => setItems((a) => a.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} placeholder="Supporting text" className={`${INPUT} mt-2`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-[12px] font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
