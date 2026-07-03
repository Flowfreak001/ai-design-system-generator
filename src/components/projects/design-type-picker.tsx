"use client";

// Design-type chooser shown after the brand guideline is approved. Selecting a
// type saves it to the project and unlocks design-system generation.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DESIGN_TYPES } from "@/lib/validators/project";

export function DesignTypePicker({
  projectId,
  current,
  save,
}: {
  projectId: string;
  current?: string;
  save: (projectId: string, designType: string) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(current ?? "");
  const [isPending, startTransition] = useTransition();

  const choose = (t: string) => {
    setSelected(t);
    startTransition(async () => {
      await save(projectId, t);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {DESIGN_TYPES.map((t) => {
        const active = selected === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => choose(t)}
            disabled={isPending}
            aria-pressed={active}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150 disabled:opacity-60 ${
              active
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-body hover:border-line-strong hover:text-ink"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
