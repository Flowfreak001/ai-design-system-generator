// Accessibility export: baseline + per-kind a11y rules for prompts.

export function accessibilitySpec(kind: string): string[] {
  const base = [
    "One logical heading level per section (H2 for section titles; H1 only in the hero).",
    "Every button/link has a descriptive accessible label.",
    "All images have meaningful alt text (or empty alt for decorative placeholders).",
    "Interactive elements are keyboard reachable with visible focus states.",
    "Text/background contrast meets WCAG AA against the approved palette.",
  ];
  const extra: Record<string, string[]> = {
    faq: ["Use button-triggered disclosure (aria-expanded + aria-controls) for each question."],
    form: ["Associate every label with its input; announce validation errors via aria-live."],
    booking: ["Associate every label with its input; date pickers must be keyboard operable."],
    navbar: ["Mobile menu is a focus-trapped dialog; Escape closes it."],
    gallery: ["Carousel/marquee is pausable; provide list semantics for screen readers."],
    testimonials: ["Quotes use blockquote/figure semantics with cited names."],
  };
  return [...base, ...(extra[kind] ?? [])];
}
