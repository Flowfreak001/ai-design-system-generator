"use client";

// Reference screenshot upload for the References tab. Images are resized and
// compressed to data URLs in the browser (no external storage needed), then
// saved to the project's "screenshots" input. These become extra evidence for
// the design system and raise the analysis accuracy score.

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Screenshot } from "@/app/(app)/projects/actions";

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxW = 1280;
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(bitmap, 0, 0, w, h);
  // JPEG at 0.72 keeps a 1280px screenshot well under ~300KB.
  return canvas.toDataURL("image/jpeg", 0.72);
}

export function ScreenshotUpload({
  projectId,
  initial,
  save,
}: {
  projectId: string;
  initial: Screenshot[];
  save: (projectId: string, shots: Screenshot[]) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [shots, setShots] = useState<Screenshot[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const persist = (next: Screenshot[]) => {
    setShots(next);
    startTransition(async () => {
      const res = await save(projectId, next);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    try {
      const added: Screenshot[] = [];
      for (const file of Array.from(files).slice(0, 12)) {
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await fileToCompressedDataUrl(file);
        if (!dataUrl || dataUrl.length > 900_000) {
          setError("One image was too large even after compression — try a smaller crop.");
          continue;
        }
        added.push({ id: crypto.randomUUID(), name: file.name, dataUrl });
      }
      if (added.length) persist([...shots, ...added].slice(0, 12));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = (id: string) => persist(shots.filter((s) => s.id !== id));
  const setNote = (id: string, note: string) => setShots(shots.map((s) => (s.id === id ? { ...s, note } : s)));

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Reference screenshots</p>
          <p className="mt-0.5 text-[13px] text-muted">
            Add desktop or mobile screenshots of key sections (hero, cards, forms, pricing, FAQ, footer).
            They give the design system visual evidence and improve accuracy.
          </p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy || isPending}>
            {busy ? "Processing…" : "Upload images"}
          </Button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {shots.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-line-strong p-6 text-center text-[13px] text-muted">
          No screenshots yet. Uploads are resized and stored with the project.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shots.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-xl border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.dataUrl} alt={s.name} className="h-36 w-full object-cover" />
              <div className="p-2.5">
                <p className="truncate text-[12px] font-medium text-ink" title={s.name}>{s.name}</p>
                <input
                  type="text"
                  value={s.note ?? ""}
                  placeholder="Note (e.g. hero — desktop)"
                  onChange={(e) => setNote(s.id, e.target.value)}
                  onBlur={() => persist(shots)}
                  className="mt-1.5 w-full rounded-md border border-line bg-canvas px-2 py-1 text-[12px] focus:border-accent/50 focus-visible:outline-none"
                />
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  className="mt-1.5 cursor-pointer text-[12px] font-medium text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
