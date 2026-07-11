"use client";

// Multi-tenant storefront renderer. Renders a published project's canvas
// sections for the public /s/<slug> site. Custom-code library sections (all
// ecommerce + most modern sections) render through the same sucrase engine the
// editor uses; the rare static section falls back to a simple content block.
import { DynamicSectionRenderer } from "@/components/section-library/dynamic-renderer";
import { createSectionTheme } from "@/components/sections/section-theme";
import type { CanvasSection, StyleGuideCanvas } from "@/lib/canvas";
import type { SectionTheme } from "@/components/sections/types";
import type { LibraryDefaultContent } from "@/lib/section-library/manual-sections";

export function StorefrontRenderer({
  sections,
  style,
}: {
  sections: CanvasSection[];
  style?: StyleGuideCanvas | null;
}) {
  const theme: SectionTheme = createSectionTheme(style ?? undefined);
  return (
    <main style={{ background: theme.backgroundColor }}>
      {sections
        .filter((s) => s.status !== "rejected")
        .map((s) =>
          s.custom?.code ? (
            <DynamicSectionRenderer
              key={s.id}
              code={s.custom.code}
              mode={s.custom.mode}
              content={(s.content ?? {}) as LibraryDefaultContent}
              theme={theme}
            />
          ) : (
            <FallbackBlock key={s.id} content={s.content} theme={theme} />
          ),
        )}
    </main>
  );
}

function FallbackBlock({ content, theme }: { content?: CanvasSection["content"]; theme: SectionTheme }) {
  const c = content ?? {};
  if (!c.title && !c.subtitle && !(c.items?.length)) return null;
  return (
    <section style={{ padding: "72px 24px", background: theme.backgroundColor, color: theme.textColor }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {c.eyebrow ? <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 12, fontWeight: 600, color: theme.accentColor }}>{c.eyebrow}</p> : null}
        {c.title ? <h2 style={{ margin: "10px 0 0", fontFamily: theme.headingFont, fontSize: 34, fontWeight: 700 }}>{c.title}</h2> : null}
        {c.subtitle ? <p style={{ margin: "10px 0 0", fontSize: 16, color: theme.mutedTextColor }}>{c.subtitle}</p> : null}
      </div>
    </section>
  );
}
