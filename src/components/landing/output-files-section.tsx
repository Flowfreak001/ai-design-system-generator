import { Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHeading } from "./section";

const OUTPUTS = [
  { f: "BRAND.md", d: "Positioning, tone of voice, trust signals, conversion message." },
  { f: "DESIGN.md", d: "Color, type, layout, components, and responsive rules." },
  { f: "CREATIVE.md", d: "Creative direction, homepage story, hero concept, motion feel." },
  { f: "CONTENT.md", d: "Content strategy and section-by-section messaging." },
  { f: "COMPONENTS.md", d: "Reusable component specs and states." },
  { f: "ANIMATION.md", d: "Motion rules — timing, easing, and do's and don'ts." },
  { f: "SEO.md", d: "Keyword targeting, page structure, and metadata." },
  { f: "PROMPT_CLAUDE_CODE.md", d: "A full build prompt tuned for Claude Code." },
  { f: "PROMPT_CODEX.md", d: "A build prompt tuned for Codex." },
  { f: "preview.html", d: "A rendered preview of the design system." },
  { f: "export package", d: "The full set, zipped and ready for your build tool." },
];

export function OutputFilesSection() {
  return (
    <section id="output" className="mx-auto max-w-6xl px-5 sm:px-8 py-24 md:py-32 scroll-mt-20">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <SectionHeading
          eyebrow="Design system output"
          title={<>Structured files, not a black box.</>}
          intro="Every project exports a complete set of AI-ready files. Readable, editable, and versioned — so your team and your tools can act on them directly."
        />

        <Stagger className="grid gap-2.5">
          {OUTPUTS.map((o) => (
            <StaggerItem key={o.f}>
              <div className="flex items-center gap-4 rounded-xl border border-line bg-white/[0.02] px-4 py-3 transition-colors duration-200 hover:border-line-strong">
                <span className="shrink-0 rounded-md bg-brand/12 px-2 py-1 font-mono text-xs text-brand">
                  {o.f}
                </span>
                <span className="text-sm text-muted">{o.d}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
