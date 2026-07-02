import { Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHeading } from "./section";

const BENEFITS = [
  { t: "Consistent by construction", d: "One system drives brand, design, content, and code — no drift between deliverables." },
  { t: "Built for AI build tools", d: "Prompts are tuned per platform, so Claude Code, Cursor, or v0 build the right thing first time." },
  { t: "Faster from brief to build", d: "Skip the blank page. Go from a structured brief to a production-ready spec in minutes." },
];

const STATS = [
  { v: "11+", l: "Output files per project" },
  { v: "12", l: "Target platforms" },
  { v: "6", l: "Specialized agents" },
  { v: "100%", l: "Editable markdown" },
];

export function TrustSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 py-24 md:py-32">
      <SectionHeading
        eyebrow="Why teams use it"
        title="A design system your team and your tools can act on."
        center
      />

      <Stagger className="mt-14 grid gap-4 md:grid-cols-3">
        {BENEFITS.map((b) => (
          <StaggerItem key={b.t}>
            <div className="card h-full p-7">
              <h3 className="text-base font-semibold">{b.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{b.d}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.l} className="bg-canvas px-6 py-8 text-center">
            <p className="text-3xl font-bold tracking-tight tnum">{s.v}</p>
            <p className="mt-2 text-xs text-muted">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
