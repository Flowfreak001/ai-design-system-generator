// Standard app-page wrapper. Every full page inside the dashboard shell should
// render its content through <PageContainer> so horizontal padding, top rhythm,
// and max width stay identical across the app. Pairs with <PageHeader>.
//
// Do NOT use this for full-bleed surfaces (the design editor, live preview) —
// those intentionally own the whole viewport.

import type { ReactNode } from "react";

export function PageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-5 py-8 sm:px-8 ${className}`}>{children}</div>;
}
