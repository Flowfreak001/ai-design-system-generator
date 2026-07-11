"use client";

// Multi-tenant storefront renderer. Renders one page of a published site with a
// top nav across the site's pages. Custom-code library sections (all ecommerce +
// most modern sections) render through the same sucrase engine the editor uses;
// the rare static section falls back to a simple content block.
import { DynamicSectionRenderer } from "@/components/section-library/dynamic-renderer";
import { createSectionTheme } from "@/components/sections/section-theme";
import type { CanvasSection, StyleGuideCanvas } from "@/lib/canvas";
import type { SectionTheme } from "@/components/sections/types";
import type { LibraryDefaultContent } from "@/lib/section-library/manual-sections";

export type SiteNavItem = { name: string; href: string; active: boolean };

export function StorefrontRenderer({
  siteName,
  nav,
  sections,
  style,
}: {
  siteName: string;
  nav: SiteNavItem[];
  sections: CanvasSection[];
  style?: StyleGuideCanvas | null;
}) {
  const theme: SectionTheme = createSectionTheme(style ?? undefined);
  return (
    <div style={{ background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.bodyFont, minHeight: "100dvh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 24px", background: theme.backgroundColor, borderBottom: `1px solid ${theme.borderColor}`, backdropFilter: "saturate(180%) blur(6px)" }}>
        <a href={nav[0]?.href ?? "#"} style={{ fontFamily: theme.headingFont, fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: theme.textColor, textDecoration: "none" }}>{siteName}</a>
        <nav style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {nav.map((n) => (
            <a key={n.href} href={n.href} style={{ fontSize: 14, fontWeight: n.active ? 600 : 500, color: n.active ? theme.textColor : theme.mutedTextColor, textDecoration: "none" }}>{n.name}</a>
          ))}
        </nav>
      </header>
      <main>
        {sections
          .filter((s) => s.status !== "rejected")
          .map((s) =>
            s.custom?.code ? (
              <DynamicSectionRenderer key={s.id} code={s.custom.code} mode={s.custom.mode} content={(s.content ?? {}) as LibraryDefaultContent} theme={theme} />
            ) : (
              <FallbackBlock key={s.id} content={s.content} theme={theme} />
            ),
          )}
      </main>
    </div>
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
