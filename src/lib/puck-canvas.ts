// Per-page Puck data for the Wireframe and Design editor stages, plus the
// conversions between Sitemap → Wireframe → Design. Pure (no JSX) so both the
// client editor and server generators can import it. The Sitemap remains the
// structural source of truth (pages → ordered sections); Wireframe/Design store
// their own Puck data per page in separate files.

import { sectionKind, type SectionKind } from "@/lib/sections";
import type { CanvasPage, CanvasSource, SectionStatus } from "@/lib/canvas";

export type PuckItem = { type: string; props: { id: string } & Record<string, unknown> };
export type PuckData = { content: PuckItem[]; root: { props?: Record<string, unknown> }; zones?: Record<string, unknown> };
export type PuckPage = { id: string; name: string; source: CanvasSource; status?: SectionStatus; data: PuckData };
export type MultiPagePuck = { pages: PuckPage[]; updatedAt?: string };

export const WIREFRAME_CANVAS_FILE = "WIREFRAME_CANVAS.json";
export const DESIGN_CANVAS_FILE = "DESIGN_CANVAS.json";

const emptyData = (): PuckData => ({ content: [], root: {} });

// A representative label per kind — drives which low-fi/styled component renders
// (renderers infer the kind from this), independent of the user's section name.
export const KIND_LABEL: Record<SectionKind, string> = {
  navbar: "Navbar", hero: "Hero", features: "Features", services: "Services",
  form: "Contact Form", booking: "Booking Form", pricing: "Pricing", faq: "FAQ",
  testimonials: "Testimonials", gallery: "Gallery", cta: "CTA", footer: "Footer",
  directory: "Listings", dashboard: "Dashboard", generic: "Content Block",
};

// Kind → Puck component type (Wireframe stage / Design stage).
export const WIREFRAME_TYPE: Record<SectionKind, string> = {
  navbar: "WireframeNavbar", hero: "WireframeHero", features: "WireframeFeatureGrid",
  services: "WireframeServices", form: "WireframeContactForm", booking: "WireframeBookingForm",
  pricing: "WireframePricing", faq: "WireframeFAQ", testimonials: "WireframeTestimonials",
  gallery: "WireframeGallery", cta: "WireframeCTA", footer: "WireframeFooter",
  directory: "WireframeContentBlock", dashboard: "WireframeContentBlock", generic: "WireframeContentBlock",
};
export const DESIGN_TYPE: Record<SectionKind, string> = {
  navbar: "NavbarSection", hero: "HeroSection", features: "FeatureGridSection",
  services: "ServicesSection", form: "ContactFormSection", booking: "BookingFormSection",
  pricing: "PricingSection", faq: "FAQSection", testimonials: "TestimonialsSection",
  gallery: "GallerySection", cta: "CTASection", footer: "FooterSection",
  directory: "ContentBlockSection", dashboard: "ContentBlockSection", generic: "ContentBlockSection",
};

/** Unique kinds mapped to each distinct component (for building the Puck config). */
const KINDS = Object.keys(KIND_LABEL) as SectionKind[];
export const WIREFRAME_COMPONENT_KINDS = KINDS.filter((k, i) => KINDS.findIndex((x) => WIREFRAME_TYPE[x] === WIREFRAME_TYPE[k]) === i);
export const DESIGN_COMPONENT_KINDS = KINDS.filter((k, i) => KINDS.findIndex((x) => DESIGN_TYPE[x] === DESIGN_TYPE[k]) === i);

let seq = 0;
const pid = (p: string) => `${p}-${Date.now().toString(36)}-${seq++}`;

/** Build initial Wireframe Puck data for every page from the approved Sitemap. */
export function sitemapToWireframe(pages: CanvasPage[]): MultiPagePuck {
  return {
    pages: pages.map((p) => ({
      id: p.id,
      name: p.name,
      source: p.source,
      status: p.status,
      data: {
        content: p.sections.map((s) => {
          const kind = sectionKind(s.name);
          return {
            type: WIREFRAME_TYPE[kind],
            props: { id: s.id || pid("s"), kind, name: s.name, note: s.note ?? "", source: s.source, status: s.status ?? "draft", variant: s.variant ?? "default" },
          };
        }),
        root: {},
      },
    })),
  };
}

/** Build initial Design Puck data from the Wireframe (same order, styled types). */
export function wireframeToDesign(wire: MultiPagePuck): MultiPagePuck {
  return {
    pages: wire.pages.map((p) => ({
      id: p.id,
      name: p.name,
      source: p.source,
      status: p.status,
      data: {
        content: p.data.content.map((item) => {
          const kind = (item.props.kind as SectionKind) ?? sectionKind(String(item.props.name ?? ""));
          return { type: DESIGN_TYPE[kind], props: { ...item.props, id: pid("d"), kind } };
        }),
        root: {},
      },
    })),
  };
}

/** Merge a Puck multi-page doc with the current sitemap: keep every sitemap
 *  page, use saved Puck data where present, else derive from the sitemap. */
export function ensurePages(saved: MultiPagePuck | null, pages: CanvasPage[], stage: "wireframe" | "design"): MultiPagePuck {
  const savedById = new Map((saved?.pages ?? []).map((p) => [p.id, p]));
  const base = stage === "wireframe" ? sitemapToWireframe(pages) : wireframeToDesign(sitemapToWireframe(pages));
  return {
    pages: base.pages.map((bp) => {
      const s = savedById.get(bp.id);
      return s ? { ...bp, data: s.data } : bp;
    }),
  };
}

/** Derive the ordered section list (name + kind) from a page's Puck content —
 *  used to mirror Puck edits back into the sitemap so MD/export stay in sync. */
export function puckToSections(data: PuckData): { name: string; kind: SectionKind; note?: string; source: CanvasSource; status?: SectionStatus }[] {
  return (data?.content ?? []).map((item) => {
    const kind = (item.props.kind as SectionKind) ?? "generic";
    return {
      name: String(item.props.name ?? KIND_LABEL[kind] ?? "Section"),
      kind,
      note: item.props.note ? String(item.props.note) : undefined,
      source: (item.props.source as CanvasSource) ?? "user-added",
      status: item.props.status as SectionStatus | undefined,
    };
  });
}

/** Convert a Design (or Wireframe) Puck multi-page doc into a SitemapCanvas —
 *  the shape MD/export generators consume. Preserves per-page ordered sections
 *  so the export uses the approved design structure across all pages. */
export function puckDocToSitemap(doc: MultiPagePuck): { pages: CanvasPage[]; approved?: boolean } {
  return {
    pages: doc.pages.map((p) => ({
      id: p.id,
      name: p.name,
      source: p.source,
      status: p.status,
      sections: p.data.content.map((item) => {
        const kind = (item.props.kind as SectionKind) ?? "generic";
        return {
          id: String(item.props.id),
          name: String(item.props.name ?? KIND_LABEL[kind] ?? "Section"),
          note: item.props.note ? String(item.props.note) : undefined,
          source: (item.props.source as CanvasSource) ?? "user-added",
          status: item.props.status as SectionStatus | undefined,
          variant: item.props.variant ? String(item.props.variant) : undefined,
        };
      }),
    })),
  };
}

export { emptyData };
