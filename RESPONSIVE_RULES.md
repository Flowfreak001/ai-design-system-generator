# Global Responsive Design Rules

These rules apply to every page, section, component, modal, navigation, form, card, grid, and interactive element in this project.
Claude must follow these rules whenever creating, editing, reviewing, or fixing frontend code.

> **Project addendum — READ FIRST (see the "Project-specific exceptions" section at the bottom).**
> This project has a **sandboxed dynamic-section engine** whose sections render inside a **scaled device-preview frame**. Inside those sections, CSS `@media` queries and `vw`/`vh` units resolve against the OUTER viewport, not the frame, so they silently break. There, Rule 3 is inverted: measuring the container with `ResizeObserver` is **required**, not forbidden. The addendum defines exactly where each rule applies.

## 1. Mobile-first development

Build every component mobile-first.
Start with the smallest screen layout, then progressively enhance it for tablet and desktop.
Do not build the desktop layout first and attempt to shrink it afterward.
The mobile version must be a properly designed layout, not a compressed desktop version.

## 2. Standard breakpoints

Use these default breakpoints unless a component genuinely requires a content-based breakpoint:

```css
/* Mobile */
0px–479px

/* Large mobile */
480px–767px

/* Tablet */
768px–1023px

/* Small desktop */
1024px–1279px

/* Large desktop */
1280px and above
```

Preferred media-query structure:

```css
/* Base styles: mobile */

@media (min-width: 480px) {
  /* Large mobile */
}

@media (min-width: 768px) {
  /* Tablet */
}

@media (min-width: 1024px) {
  /* Desktop */
}

@media (min-width: 1280px) {
  /* Large desktop */
}
```

Do not create many arbitrary breakpoints without a clear layout reason.
Prefer content-based breakpoints over device-specific breakpoints.

## 3. No JavaScript viewport detection

> **Project exception:** applies to normal full-viewport app/marketing components. For **sandboxed dynamic library sections** the opposite holds — see the addendum. Do not apply this rule to `src/lib/section-library/*` section code or `storefront-renderer`-style chrome that must work inside the preview frame.

Do not use JavaScript to control responsive layouts.
Forbidden for layout:

```js
window.innerWidth
window.matchMedia
ResizeObserver
screen.width
isMobile state
viewport width state
```

Responsive layout must be handled using:

* CSS media queries
* Container queries
* CSS Grid
* Flexbox
* Responsive sizing functions
* Intrinsic layout techniques

JavaScript may only control genuine interaction, such as:

* Opening a mobile menu
* Accordion state
* Tabs
* Modal visibility
* Carousel state

Do not render different markup based on viewport width unless there is no valid CSS alternative.

## 4. Prevent horizontal overflow

No component may create horizontal page scrolling.
Every component must be checked at:

```txt
320px
360px
375px
390px
430px
768px
1024px
1280px
1440px
```

Use these rules where appropriate:

```css
* {
  box-sizing: border-box;
}

img,
video,
svg,
canvas {
  max-width: 100%;
}

.grid-child,
.flex-child {
  min-width: 0;
}

.long-text {
  overflow-wrap: anywhere;
}
```

Check overflow especially for:

* Long headings
* Brand names
* Navigation labels
* Buttons
* Inputs
* Tables
* Code blocks
* Badges
* Cards
* Absolute-positioned elements
* Large decorative text
* Images
* Sliders
* Marquees

Do not fix layout problems by adding this globally:

```css
body {
  overflow-x: hidden;
}
```

Fix the element causing the overflow.
Local overflow clipping may only be used for intentional decorative elements.

## 5. Container rules

All major page sections should use a consistent content container.
Recommended structure:

```css
.section {
  width: 100%;
  padding-inline: 16px;
}

.section-inner {
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
}

@media (min-width: 768px) {
  .section {
    padding-inline: 24px;
  }
}

@media (min-width: 1024px) {
  .section {
    padding-inline: 32px;
  }
}
```

Default horizontal spacing:

```txt
Mobile: 16px–20px
Tablet: 24px–32px
Desktop: 32px–48px
```

Do not allow content to touch the viewport edge unless the design intentionally uses full-bleed media.
Do not apply random container widths across different sections.

## 6. Flexible sizing

Avoid rigid widths.
Do not use fixed widths such as:

```css
width: 600px;
width: 1200px;
```

unless the element must genuinely have a fixed size.
Prefer:

```css
width: 100%;
max-width: 600px;
```

Use responsive sizing functions:

```css
clamp()
min()
max()
minmax()
fit-content
```

Examples:

```css
font-size: clamp(2rem, 5vw, 5rem);

grid-template-columns:
  repeat(auto-fit, minmax(min(100%, 280px), 1fr));

width: min(100%, 720px);
```

## 7. Grid rules

Use CSS Grid for multi-column layouts.
Desktop grids must collapse intentionally.
Recommended patterns:

```css
.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
```

Every grid column should use:

```css
minmax(0, 1fr)
```

when equal-width columns are required.
Do not create layouts that leave:

* Isolated items
* Empty visual columns
* Unbalanced final rows
* Extremely narrow cards
* Newsletter or form sections compressed into unusable widths

For automatic grids, use:

```css
repeat(auto-fit, minmax(min(100%, 280px), 1fr))
```

Do not use `auto-fill` unless empty tracks are intentionally required.

## 8. Flexbox rules

All flex children that contain text, forms, or nested layouts should be reviewed for overflow.
Apply:

```css
min-width: 0;
```

where necessary.
Do not allow important controls to shrink unintentionally.
Use:

```css
flex: 0 0 auto;
```

for:

* Icon buttons
* Avatars
* Fixed action buttons
* Menu toggles
* Form submit buttons

Use wrapping where appropriate:

```css
flex-wrap: wrap;
```

Do not rely on `flex-shrink` defaults without checking the result.

## 9. Typography rules

Typography must scale responsively.
Use `clamp()` for large headings:

```css
font-size: clamp(2.25rem, 6vw, 5.5rem);
```

Minimum recommended sizes:

```txt
Body text: 16px preferred
Secondary body text: 14px minimum
Button text: 14px minimum
Navigation links: 14px minimum
Form fields: 16px on mobile
Captions: 12px minimum
```

Do not use text smaller than 12px.
Use readable line heights:

```txt
Large heading: 0.95–1.1
Section heading: 1.05–1.2
Body text: 1.5–1.7
Small text: 1.4–1.6
```

Prevent:

* Heading overlap
* Cropped ascenders or descenders
* Excessively tight line-height
* One-word orphan lines where avoidable
* Long text extending outside containers

Use balanced wrapping for headings where supported:

```css
text-wrap: balance;
```

Use readable wrapping for paragraphs:

```css
text-wrap: pretty;
```

## 10. Spacing system

Use a consistent spacing scale.
Preferred scale:

```txt
4px 8px 12px 16px 20px 24px 32px 40px 48px 64px 80px 96px 120px
```

Do not use arbitrary values unless required by the visual design.
Recommended section spacing:

```txt
Mobile vertical padding: 48px–72px
Tablet vertical padding: 64px–96px
Desktop vertical padding: 80px–128px
```

Use responsive section spacing:

```css
padding-block: clamp(48px, 8vw, 120px);
```

Reduce spacing proportionally on smaller screens.
Do not:

* Leave excessive empty gaps
* Compress mobile layouts too tightly
* Use large negative margins to force alignment
* Use spacing to compensate for incorrect layout structure

## 11. Images and media

All images must be responsive.
Use:

```css
img {
  display: block;
  width: 100%;
  height: auto;
}
```

For cropped media:

```css
.media {
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

Every image container should define its intended aspect ratio.
Do not use fixed image heights across all screen sizes unless the design requires it.
Use different aspect ratios at different breakpoints where needed.
Do not stretch or distort images.
Decorative images should not block content or create overflow.

## 12. Buttons and touch targets

All interactive controls must be easy to use on touch devices.
Minimum target size:

```txt
44px × 44px
```

This applies to:

* Buttons
* Menu toggles
* Carousel arrows
* Accordion controls
* Close buttons
* Icon links
* Checkbox and radio hit areas

Buttons must:

* Fit their label
* Allow text wrapping when necessary
* Not overflow their parent
* Not become too narrow
* Retain readable padding

Avoid fixed button widths unless all labels are controlled.
On small screens, allow primary actions to become full-width where appropriate.

## 13. Forms

Forms must remain usable at every viewport width.
Rules:

* Inputs must use `width: 100%`
* Flex-based inputs must use `min-width: 0`
* Submit buttons must not shrink unintentionally
* Labels must remain visible
* Validation messages must wrap
* Inputs must not overflow cards or modals
* Field groups must stack on mobile
* Multi-column forms may become two columns on tablet and desktop
* Mobile input font size should be at least 16px
* Do not use placeholder text as the only label

Example:

```css
.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .form-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

## 14. Navigation

Desktop navigation and mobile navigation must be intentionally designed.
Mobile navigation rules:

* Use a clear menu button
* Minimum touch target of 44px
* Menu must not be clipped by headers or containers
* Menu must be above page content using an intentional `z-index`
* Prevent background scrolling when a full-screen menu is open
* Menu must be keyboard accessible
* Escape should close overlays where applicable
* Focus should remain usable
* Long labels must wrap or truncate intentionally
* Nested navigation should use accordions or drill-down navigation

Do not simply hide desktop navigation and show an unstructured list.
Do not place mobile drawers inside parents with:

```css
overflow: hidden;
transform: translateZ(0);
filter:
perspective:
```

when those properties interfere with fixed positioning or clipping.

## 15. Cards

Cards must adapt to content.
Do not assign fixed heights merely to make cards visually equal.
Prefer:

```css
height: 100%;
display: flex;
flex-direction: column;
```

Use natural content flow.
Actions can be aligned to the bottom using:

```css
margin-top: auto;
```

Card text must not be truncated unless the design explicitly requires truncation.
Mobile cards should usually occupy the full available width.

## 16. Tables

Tables must not break mobile layouts.
Use one of these strategies:

* Horizontal scroll inside a local wrapper
* Responsive stacked rows
* Priority columns
* Card conversion on mobile

Example:

```css
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

Do not allow the full page to scroll horizontally because of a table.

## 17. Modals, drawers, and overlays

Overlays must work on small screens.
Rules:

* Use viewport-safe sizing
* Account for mobile browser height
* Use `dvh` where appropriate
* Keep close controls visible
* Allow internal scrolling
* Do not place critical buttons below unreachable areas
* Respect safe-area insets

Example:

```css
.modal {
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
}
```

For full-screen mobile overlays:

```css
height: 100dvh;
padding-bottom: env(safe-area-inset-bottom);
```

## 18. Absolute positioning

Do not use absolute positioning for primary layout.
Absolute positioning may only be used for:

* Decorative elements
* Badges
* Icons inside inputs
* Intentional overlays
* Controlled visual effects

Content must remain readable when decorative elements are removed.
Absolute elements must not cause:

* Text overlap
* Horizontal scrolling
* Hidden controls
* Broken mobile layouts

## 19. Sticky and fixed elements

Sticky and fixed elements must be tested carefully.
Check:

* Parent overflow
* Stacking context
* Mobile viewport height
* Header overlap
* Bottom navigation overlap
* Safe-area insets
* Keyboard opening on mobile

Do not use sticky behaviour on mobile when it harms readability or creates excessive viewport obstruction.

## 20. Responsive animations

Animations must not break layout.
Do not animate layout-critical width or height unnecessarily.
Prefer:

```css
transform
opacity
```

Avoid large entrance translations on mobile.
Reduce animation distance and duration on smaller screens.
Support reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Scroll-based animations must leave content visible when JavaScript is disabled or fails.

## 21. Accessibility

Every responsive component must remain accessible.
Required:

* Semantic HTML
* Visible focus states
* Keyboard navigation
* Accessible labels
* Correct heading hierarchy
* Sufficient contrast
* Proper button elements
* Proper link elements
* `aria-expanded` for accordions and menus
* `aria-controls` where appropriate
* `aria-label` for icon-only controls
* Reduced-motion support

Do not use clickable `<div>` or `<span>` elements.
Do not remove focus outlines without providing a replacement.
Hidden mobile or desktop content must not remain keyboard-focusable.

## 22. Next.js and React rules

For Next.js App Router:

* Use `"use client"` only when browser interaction or React state is required
* Avoid hydration mismatches
* Do not read viewport size during render
* Do not access `window` or `document` during server rendering
* Keep layout styling in CSS
* Use semantic HTML
* Use `next/image` where appropriate
* Always provide image dimensions or stable aspect ratios
* Prevent cumulative layout shift

Do not introduce new libraries only to solve basic responsive behaviour.

## 23. Tailwind CSS rules

When using Tailwind:

* Use mobile-first utility classes
* Avoid excessive arbitrary values
* Use project spacing and typography tokens
* Use `min-w-0` in grid and flex children
* Use `w-full max-w-*`
* Use `grid-cols-1`, then add tablet and desktop columns
* Use `overflow-x-auto` only on local elements that genuinely require it
* Avoid hiding layout defects using `overflow-hidden`

Example:

```tsx
<div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
```

Avoid:

```tsx
<div className="grid grid-cols-3 scale-75">
```

Do not use scaling to make desktop content fit mobile screens.

## 24. Component-specific responsive behaviour

Each component must define its own responsive behaviour.
Before implementation, determine:

* What stacks?
* What wraps?
* What becomes horizontally scrollable?
* What changes order?
* What becomes an accordion?
* What becomes full-width?
* What hides because it is purely decorative?
* What must always remain visible?

Do not use one generic stacking rule for every component.
Responsive design decisions must be based on content priority and usability.

## 25. Content stress testing

Every component must be tested with:

* Short text
* Long text
* Long unbroken words
* Missing optional content
* Additional list items
* Fewer list items
* Large images
* Different aspect ratios
* Long button labels
* Long brand names
* Localized content
* Dynamic CMS content

Do not design only for the placeholder content.

## 26. Required viewport testing

Before considering any component complete, verify it at:

```txt
320px 360px 375px 390px 430px 480px 768px 820px 1024px 1280px 1440px 1920px
```

At each width, confirm:

* No horizontal page scrolling
* No clipped text
* No overlapping elements
* No broken grid
* No inaccessible controls
* No compressed input fields
* No unreadable typography
* No excessive empty space
* No decorative element covering content
* No unexpected layout shift
* No hidden content required for task completion

## 27. Responsive acceptance checklist

A component is not complete until all items below pass:

```txt
[ ] Mobile-first base styles
[ ] No JavaScript viewport detection (except sandboxed sections — see addendum)
[ ] No horizontal page overflow
[ ] No fixed-width content breaking small screens
[ ] Grid collapses intentionally
[ ] Flex children use min-width: 0 where needed
[ ] Text wraps correctly
[ ] Images remain proportional
[ ] Buttons meet minimum touch size
[ ] Forms remain usable
[ ] Navigation remains accessible
[ ] Modals fit within the viewport
[ ] Mobile spacing is balanced
[ ] Desktop layout does not become excessively wide
[ ] Focus styles are visible
[ ] Reduced motion is supported
[ ] Dynamic content has been stress-tested
[ ] All required viewport widths have been reviewed
```

## 28. Claude output requirements

Whenever Claude creates or fixes a responsive component, it must:

1. Return the complete corrected component.
2. Preserve existing functionality unless explicitly instructed otherwise.
3. Preserve the intended visual design.
4. Explain only the important responsive changes.
5. Avoid partial snippets when a full component was requested.
6. Avoid adding unnecessary dependencies.
7. Check the component against this responsive rule file.
8. Fix root layout problems instead of hiding them.
9. Keep code production-ready.
10. Do not claim the component is responsive without checking all required viewport states.

---

## Project-specific exceptions (Flowfreak section engine)

This codebase has **two rendering contexts**, and the rules above apply differently to each. Identify which context a file belongs to before applying Rule 3, `@media`, and viewport units.

### A. Normal app / marketing components (default)

Anything rendered full-viewport: `app/`, `components/` (landing, layout, projects, ui, editor chrome), pages, modals. **All 28 rules above apply as written.** Use CSS `@media`, `clamp()`, `vw`, container queries. Do NOT use JS viewport detection here (Rule 3 holds).

### B. Sandboxed dynamic library sections (Rule 3 is INVERTED here)

Files: `src/lib/section-library/builtin-sections.json` section `tsxCode`, anything authored for the sucrase/`DynamicSectionRenderer` engine, and any component that must render correctly inside the **scaled device-preview frame** (`full-section-preview.tsx`, the library card thumbnails, the preview modal).

These render inside a transformed/scaled frame, so **viewport-relative CSS silently resolves against the OUTER page, not the section's frame**. Therefore, inside these sections:

- **Required, not forbidden:** measure the section's own width with a `ResizeObserver` and branch layout on that px value. Also read `getBoundingClientRect().width` **immediately on mount** — the ResizeObserver initial callback is not guaranteed to fire in the frame.
- **Forbidden inside section code:** CSS `@media` queries, and `vw` / `vh` / `dvh` units for any sizing (drawer/overlay widths, oversized wordmarks, hero heights). Derive those from the measured width in px instead. Symptoms of violating this: columns don't stack, drawers render huge or ~44px, wordmarks clip, everything crams into one row.
- **`position: fixed` overlays** (mobile drawers, mega-menus) in the preview frame need the frame to use `contain: layout paint` to become their containing block. `transform: translateZ(0)` normalizes to a 2D identity matrix, which Chrome does NOT treat as a fixed-containing block, so overlays escape to the viewport. (Already handled in `full-section-preview.tsx`.)
- Everything else in Rules 4–27 still applies (no overflow, touch targets, accessibility, reduced motion, min-width:0, image sizing, content stress-testing at the listed widths, etc.).

### Why the split exists

`storefront-renderer.tsx` at `/s/<slug>` renders full-page in production, so there the viewport IS the device and `vw`/`@media` are correct — but the SAME markup viewed inside the library preview frame would break, which is why the reusable **section** code is the part that must be container-measured. When in doubt: if the component can ever be shown inside a scaled preview frame, treat it as context B.

See the memory note `responsive-by-default` for the short version.
