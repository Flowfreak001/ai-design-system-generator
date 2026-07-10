"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "./section";
import { WorkflowNodeCard, NodeConnector } from "@/components/workflow/workflow-node";

const EASE = [0.22, 1, 0.36, 1] as const;

const POINTS = [
  { t: "Nodes anyone can read", d: "Triggers, AI steps, conditions, actions, and approvals — labeled in plain language." },
  { t: "Blueprint before build", d: "Design and agree the flow with your client before any integration work starts." },
  { t: "Status you can see", d: "Every node shows its state; every run is logged with step-by-step detail." },
];

export function WorkflowSection() {
  const reduce = useReducedMotion();
  return (
    <section id="workflow" className="mx-auto max-w-[1280px] px-5 sm:px-12 py-24 md:py-28 scroll-mt-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Visual workflow builder"
            title="Build workflows your clients can understand."
            intro="A plumber's enquiry flow, drawn the way you'd explain it on a whiteboard."
          />
          <ul className="mt-8 grid gap-5">
            {POINTS.map((p) => (
              <li key={p.t} className="flex gap-3.5">
                <span className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-accent/60 bg-accent-soft" />
                <div>
                  <p className="text-[15px] font-semibold text-ink">{p.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{p.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="canvas-grid rounded-2xl border border-line p-5 sm:p-8"
        >
          <div className="mx-auto flex max-w-xs flex-col items-center">
            <WorkflowNodeCard kind="TRIGGER" title="Website form submitted" description="New enquiry arrives from the site or WhatsApp." />
            <NodeConnector />
            <WorkflowNodeCard kind="AI_CLASSIFY" title="Classify enquiry" description="Extract service type, urgency, location, missing info." />
            <NodeConnector label="Urgent?" />
            <WorkflowNodeCard kind="CREATE_LEAD" title="Save lead & notify owner" description="Lead recorded; owner alerted for emergencies." />
            <NodeConnector />
            <WorkflowNodeCard kind="HUMAN_APPROVAL" title="Owner reviews AI-drafted reply" description="Nothing reaches the customer without a yes." status="Waiting" />
            <NodeConnector />
            <WorkflowNodeCard kind="SEND_EMAIL" title="Send response" description="Approved reply goes out; follow-up scheduled." />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
