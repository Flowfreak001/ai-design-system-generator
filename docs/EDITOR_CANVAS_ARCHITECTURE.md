# Editor canvas architecture

Research outcome: use the right tool per editor stage. Do **not** hand-build
every canvas, and do **not** use one library for all stages.

| Stage | Library | Why |
| --- | --- | --- |
| **Sitemap** | **React Flow** (`@xyflow/react`) | Project → Pages → child pages is a node/edge graph. React Flow gives nodes, connections, pan/zoom, and draggable positions for free. Handles **structure only**. |
| **Wireframe** | **Custom zoomable page-frame canvas** (`components/editor/project-canvas.tsx`) | A wireframe is not a graph — it's a set of full-page frames, each a vertical stack of sections in document flow. tldraw is overkill for this; a scaled/scrollable canvas of real page frames is simpler, reliable, and matches the reference tools. |
| **Design** | **Puck** (`@measured/puck`) — *deferred* | The hi-fi step is a real styled-React section editor. Puck is purpose-built for editing/reordering React components with props. Planned next; today the Design tab reuses the same page-frame canvas with real styled section components. |

## Rules

- React Flow is **only** for the Sitemap. Never for the real page design.
- The Wireframe canvas is **not** a React Flow graph — it is a page-frame canvas.
- Puck is **only** for the Design canvas (when integrated). Never for the sitemap.
- No full Figma clone.

## Current status

- **Sitemap** — React Flow graph (`sitemap-flow.tsx`): add/remove/rename nodes,
  source labels, pan/zoom, persisted node positions.
- **Wireframe** — `ProjectCanvas` (mode `"wireframe"`): all pages render together,
  each a vertical frame with stacked low-fi sections (no overlap, `flex flex-col`
  + guaranteed per-section min-heights), zoom / fit-all / device toggle,
  select page/section, add page (appears immediately), add section to the
  selected page. Saved to `SITEMAP_CANVAS.json`; verified save + reload restores
  all pages and sections.
- **Design** — `ProjectCanvas` (mode `"design"`): same multi-page canvas with
  **real styled** section components (`components/sections/*`) using Style Guide
  tokens. Puck integration + `DESIGN_CANVAS.json` is the next step.

## Data → export

All editor state (pages, ordered sections, source labels, status, variant,
scheme) persists to `SITEMAP_CANVAS.json` + `STYLE_GUIDE_CANVAS.json`, and MD /
prompt generation + `REACT_EXPORT_PLAN.json` follow the latest approved order.
