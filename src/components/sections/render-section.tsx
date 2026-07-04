"use client";

// Render a section from the registry given { type, variant, content, theme }.
// Falls back safely: missing variant → default variant; invalid variant →
// default; unknown type → a clean "unsupported" placeholder.

import type { SectionProps, SectionType, SectionTheme } from "./types";
import { getSectionComponent } from "./registry";
import { sectionTypeForKind, resolveVariantMeta } from "./catalog";
import { resolveTheme } from "./section-theme";

export function RenderSection(props: SectionProps) {
  const type = props.type;
  if (!type) return <UnsupportedSection label="Missing section type" theme={props.theme} />;
  const Comp = getSectionComponent(type, props.variant);
  if (!Comp) return <UnsupportedSection label={`Unsupported section type: ${type}`} theme={props.theme} />;
  return <Comp {...props} />;
}

export function renderSection(section: SectionProps) {
  return <RenderSection {...section} />;
}

/**
 * Editor bridge: render a section from the editor's inferred `kind`
 * (navbar/hero/services/...) + chosen variant id, mapping to the library.
 * TODO(editor): call this from the design canvas for each section.
 */
export function renderSectionByKind(
  kind: string,
  variantId: string | undefined,
  props: {
    name?: string; note?: string; theme?: SectionTheme; mobile?: boolean; assetSide?: "left" | "right"; hidden?: string[];
    onEditText?: (field: "title" | "description", value: string) => void;
    iconKey?: string; imageUrl?: string; onEditIcon?: (k: string) => void; onEditImage?: (v: string) => void;
    contentItems?: import("./types").SectionContentItem[]; onEditItems?: (items: import("./types").SectionContentItem[]) => void;
    /** Edited content from the Section Settings drawer (overrides name/note). */
    content?: { eyebrow?: string; title?: string; subtitle?: string; description?: string; primaryButtonLabel?: string; primaryButtonHref?: string; secondaryButtonLabel?: string; secondaryButtonHref?: string };
  },
) {
  const type = sectionTypeForKind(kind);
  const meta = resolveVariantMeta(type, variantId);
  const c = props.content ?? {};
  // Bridge edited items into every classic section's `items` prop. Editor items
  // use {title,text,href,icon}; components read per-kind aliases (question/
  // answer, quote/author/role, label/value, price…), so map them all.
  const items = props.contentItems?.length
    ? props.contentItems.map((it) => {
        const x = it as { title?: string; text?: string; href?: string; icon?: string; image?: string };
        return {
          ...x,
          description: x.text,
          question: x.title, answer: x.text,
          quote: x.text, author: x.title, role: x.href,
          label: x.title, value: x.text,
          price: x.icon,
        };
      })
    : undefined;
  return (
    <RenderSection
      type={type}
      variant={meta?.id}
      title={c.title ?? props.name}
      description={c.description ?? props.note}
      eyebrow={c.eyebrow}
      subtitle={c.subtitle}
      primaryButtonLabel={c.primaryButtonLabel}
      primaryButtonHref={c.primaryButtonHref}
      secondaryButtonLabel={c.secondaryButtonLabel}
      secondaryButtonHref={c.secondaryButtonHref}
      theme={props.theme}
      mobile={props.mobile}
      assetSide={props.assetSide}
      hidden={props.hidden}
      onEditText={props.onEditText}
      iconKey={props.iconKey}
      imageUrl={props.imageUrl}
      onEditIcon={props.onEditIcon}
      onEditImage={props.onEditImage}
      items={items}
      contentItems={props.contentItems}
      onEditItems={props.onEditItems}
    />
  );
}

function UnsupportedSection({ label, theme }: { label: string; theme?: SectionTheme }) {
  const t = resolveTheme(theme);
  return (
    <section className="px-8 py-12 text-center" style={{ background: t.surfaceColor }}>
      <p className="text-[13px] font-medium" style={{ color: t.mutedTextColor, fontFamily: t.bodyFont }}>{label}</p>
      <p className="mt-1 text-[11.5px]" style={{ color: t.mutedTextColor, opacity: 0.7 }}>This section type is not in the library yet (Phase 2).</p>
    </section>
  );
}
