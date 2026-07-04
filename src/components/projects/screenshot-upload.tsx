"use client";

// Reference screenshot upload for the References tab. Images are resized and
// compressed to data URLs in the browser (no external storage needed), then
// saved to the project's "screenshots" input. These become extra evidence for
// the design system and raise the analysis accuracy score.

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const [dragging, setDragging] = useState(false);
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

  const openPicker = () => fileRef.current?.click();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onFiles(e.dataTransfer.files);
  };

  return (
    <div className="card p-5">
      <div>
        <p className="text-sm font-semibold text-ink">Reference screenshots</p>
        <p className="mt-0.5 text-[13px] text-muted">
          Add desktop or mobile screenshots of key sections (hero, cards, forms, pricing, FAQ, footer).
          They give the design system visual evidence and improve accuracy.
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      {/* Primary dropzone — industry-standard drag & drop + browse. Shown full
          width when empty; once images exist it moves alongside them as an
          "add more" tile in the grid below. */}
      {shots.length === 0 && (
        <div
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
            dragging ? "border-accent bg-accent-soft/40" : "border-line-strong hover:border-accent/60 hover:bg-panel/50"
          }`}
        >
          <UploadCloudIcon className="text-faint" />
          <p className="mt-4 text-[15px] font-semibold text-ink">
            {busy ? "Processing…" : "Choose a file or drag & drop it here"}
          </p>
          <p className="mt-1 text-[13px] text-muted">PNG or JPG · up to 12 images · desktop or mobile screenshots</p>
          <span className="mt-5 inline-flex items-center rounded-lg border border-line-strong bg-surface px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-accent hover:text-accent">
            Browse file
          </span>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {shots.length > 0 && (
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

          {/* Add-more tile — the upload option sits right next to the images. */}
          <button
            type="button"
            onClick={openPicker}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            disabled={busy || isPending || shots.length >= 12}
            className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              dragging ? "border-accent bg-accent-soft/40" : "border-line-strong hover:border-accent/60 hover:bg-panel/50"
            }`}
          >
            <UploadCloudIcon className="text-faint" small />
            <span className="mt-2 text-[13px] font-semibold text-ink">
              {busy ? "Processing…" : shots.length >= 12 ? "Limit reached (12)" : "Add more"}
            </span>
            <span className="mt-0.5 text-[11.5px] text-muted">Click or drop images</span>
          </button>
        </div>
      )}
    </div>
  );
}

function UploadCloudIcon({ className = "", small = false }: { className?: string; small?: boolean }) {
  const s = small ? 26 : 40;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M7 18a4 4 0 0 1-.5-7.97 5.5 5.5 0 0 1 10.7-1.2A4.5 4.5 0 0 1 17 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 12v6m0-6-2.2 2.2M12 12l2.2 2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
