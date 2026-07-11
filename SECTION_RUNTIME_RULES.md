# Section Runtime Rules

**Do not apply normal browser viewport responsive assumptions to generated sections rendered inside the Flowfreak preview canvas.**

Flowfreak has two rendering contexts. Identify the context BEFORE writing responsive code.
(General responsive standards live in `RESPONSIVE_RULES.md`; this file defines the section engine's runtime contract.)

## Context A — normal application components

`app/`, dashboard, settings, modals, marketing pages — anything that renders full-viewport.

Use: CSS media queries, normal responsive utilities, viewport-relative behaviour where appropriate.
Do NOT use JavaScript viewport detection for basic layout.

## Context B — generated preview-frame sections

Generated headers/heroes/footers/etc. — anything compiled by the dynamic section engine
(`builtin-sections.json` `tsxCode`, Studio-authored sections) and rendered by
`DynamicSectionRenderer`. These may appear inside scaled library thumbnails, the preview modal,
the device-frame full preview, the editor canvas, or the hosted storefront. The preview canvas may
be scaled, resized, or docked beside editor UI — the browser viewport does NOT represent the
section's available width.

Use the **shared Section Runtime** (`src/components/section-runtime/`):

```tsx
import { useSectionRuntime, isCompactBreakpoint } from "section-runtime";

export default function Section({ content = {}, theme = {} }) {
  const { width, breakpoint, isPreview } = useSectionRuntime();
  const mobile = isCompactBreakpoint(breakpoint); // mobile | largeMobile
  ...
}
```

- `SectionRuntimeShell` (mounted automatically by `DynamicSectionRenderer`) measures the section
  root once with a single `ResizeObserver`, resolves the standard container breakpoint, provides
  it via context, and stamps `data-section-runtime data-breakpoint data-container-width
  data-preview` on the root.
- Standard breakpoints (`SECTION_BREAKPOINTS`): mobile 0 · largeMobile 480 · tablet 768 ·
  desktop 1024 · wide 1280. **No section defines its own breakpoint numbers.**
- CSS may target the stamped attribute instead of JS conditions:
  `[data-breakpoint="tablet"] .grid { grid-template-columns: repeat(2, minmax(0,1fr)); }`
  (emit it in the section's `<style>` tag, scoped to your own classes).
- Use JS breakpoint values only where markup/interaction genuinely changes: accordions,
  mobile-vs-desktop nav semantics, carousel behaviour, disabling expensive animations.

### Forbidden inside section code

- Local `ResizeObserver` / `window.innerWidth` / `screen.width` / `matchMedia` for layout.
- CSS `@media` width queries (they resolve against the OUTER viewport, not the frame).
  Exception: `@media (prefers-reduced-motion: reduce)` is a user preference, always allowed.
- `vw` / `vh` / `dvh` for critical layout, overlays, or typography. Bounded
  `clamp(px, vw, px)` in legacy sections is tolerated but do not add new ones.
- Custom breakpoint constants; scaling a desktop layout to fake mobile.
- `getBoundingClientRect()` for breakpoint decisions (see measurement note).

### Measurement decision (verified in this codebase — do not change casually)

Preview hosts scale sections with `transform: scale()` (library card thumbnails lay sections out
at a 1440px BASE width and scale ~0.24; the preview modal scales-to-fit).
`getBoundingClientRect()` returns the visually TRANSFORMED size there —
`offsetWidth` and ResizeObserver's `contentRect` return the untransformed LAYOUT size, which is
what the section's own CSS actually resolves against. The runtime therefore measures
`offsetWidth` (+ RO `contentRect`) and never multiplies by `previewScale`.
Empirically verified: all `/components` thumbnails report `data-container-width="1440"` →
breakpoint `wide` while being ~360px visually — the desktop thumbnail rendering we want.

### Overlays (drawers, mega-menus, popovers) in the preview

- Overlays must stay scoped to the preview frame, never escape into the dashboard.
- The device-frame full preview (`full-section-preview.tsx`) uses `contain: layout paint` on the
  frame so `position: fixed` overlays are contained. NOTE: `transform: translateZ(0)` does NOT
  work for this — it normalizes to a 2D identity matrix, which Chrome does not treat as a
  fixed-containing block.
- Containment is applied ONLY on that frame — never globally — because `contain` changes fixed /
  sticky behaviour, portals, and stacking contexts.
- `SectionRuntimeShell` renders a `<div data-preview-overlay-root>` inside preview mounts as a
  portal target for future overlay work.
- Size overlays from the measured container width in px (e.g. `Math.min(360, width * 0.86)`),
  never `vw`.

### Diagnostics & QA

- `<SectionRuntimeShell debug>` (or `DynamicSectionRenderer debug`) shows a dev-only readout:
  container width/height, resolved breakpoint, preview state/scale. Never renders in production.
- `validateSectionRoot(el)` (`section-runtime/validate-section.ts`) checks a rendered section for
  horizontal overflow, children escaping the root, zero-width containers, missing runtime wrapper
  and over-wide fixed elements → structured `SectionValidationResult`. Use it in dev consoles and
  future automated QA.

### Migration status

Migrated to the runtime (seed v80): store-header, store-footer, ecommerce-trending-carousel,
store-category-tiles, ecommerce-product-grid. store-hero is fluid (no breakpoint branches; bounded
clamp values only). **Backlog:** the remaining builtin sections still use bounded `clamp(px,vw,px)`
font-sizes or no responsive logic — they render correctly but should adopt the runtime when next
touched. Any NEW section MUST use the runtime from v1.
