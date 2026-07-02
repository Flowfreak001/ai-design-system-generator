// Consistent page header used across all app pages: title + context line on
// the left, primary action on the right. Keeps every page's top rhythm equal.

import type { ReactNode } from "react";
import { FadeUp } from "@/components/ui/motion";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <FadeUp className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
        {description && <p className="mt-1 max-w-xl text-[13.5px] text-muted">{description}</p>}
      </div>
      {action}
    </FadeUp>
  );
}
