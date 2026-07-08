"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/button";
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/motion";
import { StatusBadge, ScoreRing, useBriefs } from "./shared";
import type { Brief } from "@/lib/brief/types";

function relative(iso: string) {
  const diff = Date.now() - +new Date(iso);
  const d = Math.floor(diff / 86400000);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function BriefRow({ b }: { b: Brief }) {
  return (
    <Link href={`/brief/${b.id}`} className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <p className="truncate text-[15px] font-semibold text-ink">{b.businessName}</p>
          <StatusBadge status={b.status} />
        </div>
        <p className="mt-0.5 truncate text-[13px] text-muted">
          {b.clientName} · {b.industry} · updated {relative(b.updatedAt)}
        </p>
      </div>
      {b.score ? (
        <ScoreRing value={b.score.overall} size={46} stroke={5} />
      ) : (
        <span className="text-[12px] text-faint">No score</span>
      )}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-faint"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </Link>
  );
}

export function BriefDashboard() {
  const briefs = useBriefs();
  const drafts = briefs.filter((b) => b.status === "draft");
  const active = briefs.filter((b) => b.status !== "draft");
  const avg = briefs.filter((b) => b.score).length
    ? Math.round(briefs.filter((b) => b.score).reduce((a, b) => a + (b.score?.overall ?? 0), 0) / briefs.filter((b) => b.score).length)
    : 0;

  return (
    <PageContainer>
      <PageHeader
        title="Flowfreak Brief"
        description="Turn client meeting notes, transcripts, or guided answers into a structured, export-ready website brief."
        action={
          <LinkButton href="/brief/new">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="-ml-0.5"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            New Brief
          </LinkButton>
        }
      />

      <FadeUp className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total briefs", value: briefs.length },
          { label: "Drafts", value: drafts.length },
          { label: "Avg. quality score", value: `${avg}%` },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-line bg-surface p-5">
            <p className="text-[12px] font-medium uppercase tracking-wide text-faint">{k.label}</p>
            <p className="mt-2 text-[28px] font-bold tracking-tight text-ink">{k.value}</p>
          </div>
        ))}
      </FadeUp>

      <div className="mt-10">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-faint">Recent briefs</h3>
        {active.length ? (
          <Stagger className="mt-4 space-y-3">
            {active.map((b) => <StaggerItem key={b.id}><BriefRow b={b} /></StaggerItem>)}
          </Stagger>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-line p-8 text-center text-[14px] text-muted">No active briefs yet.</p>
        )}
      </div>

      {drafts.length > 0 && (
        <div className="mt-10">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-faint">Drafts</h3>
          <Stagger className="mt-4 space-y-3">
            {drafts.map((b) => <StaggerItem key={b.id}><BriefRow b={b} /></StaggerItem>)}
          </Stagger>
        </div>
      )}
    </PageContainer>
  );
}
