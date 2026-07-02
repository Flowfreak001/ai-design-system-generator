import { Stagger, StaggerItem, HoverLift } from "@/components/ui/motion";
import { SectionHeading } from "./section";

const FEATURES = [
  { t: "Structured project input", d: "Capture goals, audience, brand, pages, services, and platform in one considered brief." },
  { t: "Reference & competitor analysis", d: "Point at existing sites and competitors so the system designs with real context." },
  { t: "Brand & content strategy", d: "Tone of voice, positioning, trust signals, and conversion messaging — not filler." },
  { t: "Design rules & tokens", d: "Color usage, typography, layout, components, and responsive rules as a real system." },
  { t: "Animation direction", d: "Premium, controlled motion guidance — feel, timing, and do's and don'ts." },
  { t: "SEO structure", d: "Keyword targeting, page structure, and metadata baked into the output." },
  { t: "Platform-specific prompts", d: "Ready prompts for Claude Code, Codex, Cursor, v0, Webflow, Wix, WordPress and more." },
  { t: "Preview & export", d: "Preview the system and export the whole package for your build tool." },
];

function Dot() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-lg border border-line-strong bg-white/[0.03] text-brand">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function FeatureSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 sm:px-8 py-24 md:py-32 scroll-mt-20">
      <SectionHeading
        eyebrow="What it produces"
        title="Everything a real design system needs — generated."
        intro="Each project runs a pipeline of specialized agents. The output is structured, professional, and ready to hand to a build tool."
      />
      <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <StaggerItem key={f.t}>
            <HoverLift className="card h-full p-6">
              <Dot />
              <h3 className="mt-5 text-[15px] font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.d}</p>
            </HoverLift>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
