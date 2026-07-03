# Component Sources & MCP Plan

MCP/component sources are **development accelerators only** — never the final
product experience. Every imported/generated component is normalized to our
rules before it enters the registry:

- Tailwind + shadcn-compatible where useful
- **style-guide-token driven** (reads `SectionTheme`, no hardcoded brand colors)
- responsive, editable props, export-ready
- **grey image placeholders by default** — no stock, no copyrighted/reference images
- no hardcoded brand-specific copy, no excessive animation (respect `prefers-reduced-motion`)

## Status in this repo

The shadcn / Magic UI / 21st.dev / Aceternity MCP servers are **not connected**
in this environment (registry lookup returned none). Until they're added via
`claude mcp` / the connector settings, Phase 1 components are hand-authored to
the same target patterns. When the MCPs are connected, use them to generate
_candidates_, then run each candidate through the "Normalization checklist"
below before registering.

## Source → category plan

| Category | Primary source | Secondary | Notes |
| --- | --- | --- | --- |
| Atomic Elements | **shadcn MCP** | — | Stable primitives (button, input, badge, container). |
| Blocks / Widgets | **shadcn** | Magic UI, 21st.dev | Cards, stats, forms, logos, comparison. |
| Full Sections | **21st.dev Magic** | Aceternity, our custom | Unique section variations. |
| Motion / Interaction | **Magic UI** | Aceternity, Framer Motion presets | Reveal, hover, sticky, marquee. |
| Forms | shadcn | 21st.dev | Contact/quote/booking/newsletter. |
| Cards | shadcn | Magic UI | Feature/service/testimonial/pricing. |
| Galleries | Aceternity | Magic UI | Grid, marquee, hover-expand. |
| Accordions / Tabs | shadcn | — | Accessible primitives. |
| CTAs | 21st.dev | Aceternity | Gradient / split / banner. |
| Pricing | shadcn | 21st.dev | Toggle, highlight, comparison. |
| Testimonials | 21st.dev | Magic UI | Single spotlight, grid, marquee. |
| Dashboard previews | Aceternity | custom | Mockup chrome, KPI cards. |
| Sticky / scroll / hover | **Aceternity** | Magic UI | Premium interaction sections. |

## Priority order

1. **shadcn MCP** — stable primitives & blocks.
2. **Magic UI MCP** — polished motion/effects.
3. **21st.dev Magic MCP** — unique component variations.
4. **Aceternity MCP** — premium animated/interactive sections.
5. **Our own private shadcn registry** — later, once patterns stabilize.

## Normalization checklist (every candidate)

1. Convert to a `SectionComponent` (`SectionProps` in, theme via `resolveTheme`).
2. Replace all colors/fonts/radius with `SectionTheme` tokens.
3. Replace images with the grey `Ph` placeholder + `assetRoles`.
4. Strip brand-specific copy → generic slot text.
5. Gate motion behind `prefers-reduced-motion`; keep it subtle.
6. Register in `src/lib/element-library/registry.ts` (+ `catalog.ts` / section
   `registry.ts` if it's a new `block`/`section` variant) with full metadata.

## Architecture

```
src/components/atomic/     primitives (Container, Heading, Text, Button, Badge)
src/components/blocks/     new reusable blocks (Phase 1+)
src/components/sections/   full sections + sections/blocks (existing)
src/lib/element-library/   registry, categories, recommendations, search
src/lib/section-library/   curated section sets + motion/interaction presets
```
