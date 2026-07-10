import { Stagger, StaggerItem, HoverLift } from "@/components/ui/motion";
import { SectionHeading } from "./section";

const USE_CASES = [
  {
    biz: "Plumbers & trades",
    trigger: "Website form / WhatsApp enquiry",
    ai: "Classifies urgency, drafts a reply",
    outcome: "Emergency routed instantly; quote follow-ups never missed",
  },
  {
    biz: "Restaurants",
    trigger: "Catering or booking request",
    ai: "Extracts date, guests, budget; drafts a quote",
    outcome: "Manager approves; enquiry answered in minutes",
  },
  {
    biz: "Real estate",
    trigger: "Tenant maintenance request",
    ai: "Classifies issue, suggests vendor type",
    outcome: "Ticket created, manager notified, tenant kept updated",
  },
  {
    biz: "Taxi / car rental",
    trigger: "Booking enquiry",
    ai: "Drafts price estimate, collects documents",
    outcome: "Abandoned quotes followed up automatically",
  },
  {
    biz: "Clinics & salons",
    trigger: "Appointment request",
    ai: "Handles intake details, drafts confirmations",
    outcome: "Fewer no-shows, reviews requested after visits",
  },
  {
    biz: "Agencies",
    trigger: "New client brief",
    ai: "Generates scope, design, content, and build prompts",
    outcome: "Proposal-ready files and a clean delivery handoff",
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="border-y border-line bg-surface scroll-mt-20">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-12 py-24 md:py-28">
        <SectionHeading
          eyebrow="Built for real small businesses"
          title="What you can build."
          intro="Practical workflows with a trigger, an AI step, and a human-approved outcome — no code required to plan them."
        />
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((u) => (
            <StaggerItem key={u.biz}>
              <HoverLift className="card h-full p-5">
                <p className="text-[15px] font-semibold tracking-[-0.01em]">{u.biz}</p>
                <dl className="mt-4 grid gap-2.5 text-[13px] leading-relaxed">
                  <Row k="Trigger" v={u.trigger} />
                  <Row k="AI" v={u.ai} accent />
                  <Row k="Outcome" v={u.outcome} />
                </dl>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="grid grid-cols-[64px_1fr] gap-2">
      <dt className={`font-mono text-[10px] uppercase tracking-wider pt-0.5 ${accent ? "text-accent" : "text-faint"}`}>
        {k}
      </dt>
      <dd className="text-body">{v}</dd>
    </div>
  );
}
