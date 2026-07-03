"use client";

// Post-creation design pipeline. An ordered, gated set of stages — Brand
// Guideline is the foundation and every later stage unlocks only once the prior
// one is complete: Brand → Crawl → Sitemap → Wireframe → Style → Design →
// Files → Export. All structural data is derived from real analysis (discovered
// pages, detected sections, rendered tokens) and labelled by source; nothing is
// a hardcoded section list.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ActionDialog } from "@/components/projects/action-dialog";
import { DesignTypePicker } from "@/components/projects/design-type-picker";
import type { ComputedStage, StageId } from "@/lib/pipeline";

export type SourceLabel =
  | "extracted"
  | "vision-detected"
  | "reference-inspired"
  | "detected"
  | "user-added"
  | "AI-suggested"
  | "inferred"
  | "assumed";

const SOURCE_STYLE: Record<string, string> = {
  extracted: "bg-success-soft text-success",
  detected: "bg-success-soft text-success",
  "vision-detected": "bg-info-soft text-info",
  "reference-inspired": "bg-info-soft text-info",
  "user-added": "bg-accent-soft text-accent",
  "AI-suggested": "bg-warning-soft text-warning",
  inferred: "bg-warning-soft text-warning",
  assumed: "bg-panel text-muted",
};

function SourceChip({ source }: { source: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_STYLE[source] ?? "bg-panel text-muted"}`}>
      {source}
    </span>
  );
}

export type DiscoveredPage = { url: string; pageType: string; title?: string; ok: boolean };
export type CanvasPage = { name: string; source: string };
export type WireframePage = { page: string; sections: { label: string; source: string }[] };
export type StyleGuide = {
  host: string | null;
  source: string;
  colors: { name: string; value: string }[];
  bodyFont: string | null;
  displayFont: string | null;
  bodySizePx: number;
  headingWeight: number | string;
  radiusPx: number;
  spacingPx: number;
} | null;

type Actions = {
  generateBrand: () => Promise<void>;
  approveBrand: () => Promise<void>;
  crawl: () => Promise<void>;
  confirmPages: (pages: string[]) => Promise<{ error?: string }>;
  approveStage: (stage: string) => Promise<{ error?: string }>;
  setDesignType: (projectId: string, designType: string) => Promise<{ error?: string }>;
  generateMd: () => Promise<void>;
  generatePreview: () => Promise<void>;
};

export function ProjectPipeline({
  projectId,
  stages,
  brandExists,
  brandApproved,
  designType,
  hasReference,
  discovered,
  confirmedPages,
  sitemap,
  wireframe,
  style,
  previewExists,
  producedFiles,
  exportHref,
  actions,
}: {
  projectId: string;
  stages: ComputedStage[];
  brandExists: boolean;
  brandApproved: boolean;
  designType?: string;
  hasReference: boolean;
  discovered: DiscoveredPage[];
  confirmedPages: string[];
  sitemap: CanvasPage[];
  wireframe: WireframePage[];
  style: StyleGuide;
  previewExists: boolean;
  producedFiles: string[];
  exportHref: string;
  actions: Actions;
}) {
  const current = stages.find((s) => s.status === "active")?.id ?? "export";
  const [open, setOpen] = useState<StageId>(current);

  return (
    <div className="grid gap-3">
      {stages.map((s, i) => (
        <StageCard
          key={s.id}
          stage={s}
          index={i}
          open={open === s.id}
          onToggle={() => s.status !== "locked" && setOpen((o) => (o === s.id ? ("" as StageId) : s.id))}
        >
          <StageBody
            id={s.id}
            projectId={projectId}
            brandExists={brandExists}
            brandApproved={brandApproved}
            designType={designType}
            hasReference={hasReference}
            discovered={discovered}
            confirmedPages={confirmedPages}
            sitemap={sitemap}
            wireframe={wireframe}
            style={style}
            previewExists={previewExists}
            producedFiles={producedFiles}
            exportHref={exportHref}
            actions={actions}
          />
        </StageCard>
      ))}
    </div>
  );
}

function StageCard({
  stage,
  index,
  open,
  onToggle,
  children,
}: {
  stage: ComputedStage;
  index: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const locked = stage.status === "locked";
  const done = stage.status === "done";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: locked ? 0.65 : 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="card overflow-hidden p-0"
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={locked}
        className="flex w-full items-center gap-3 px-5 py-4 text-left disabled:cursor-not-allowed"
      >
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${
            done ? "bg-success text-white" : locked ? "bg-panel text-faint" : "bg-accent text-white"
          }`}
        >
          {done ? "✓" : locked ? "🔒" : stage.step}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-ink">{stage.label}</span>
            {done && <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-medium text-success">done</span>}
            {stage.status === "active" && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">current</span>}
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-muted">{stage.description}</span>
        </span>
        {!locked && (
          <span className={`text-faint transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">⌄</span>
        )}
      </button>
      {open && !locked && <div className="border-t border-line px-5 py-4">{children}</div>}
    </motion.div>
  );
}

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<{ error?: string } | void>) =>
    start(async () => {
      const res = await fn();
      if (res && "error" in res && res.error) setError(res.error);
      else {
        setError(null);
        router.refresh();
      }
    });
  return { run, pending, error };
}

function StageBody({
  id,
  projectId,
  brandExists,
  brandApproved,
  designType,
  hasReference,
  discovered,
  confirmedPages,
  sitemap,
  wireframe,
  style,
  previewExists,
  producedFiles,
  exportHref,
  actions,
}: {
  id: StageId;
  projectId: string;
  brandExists: boolean;
  brandApproved: boolean;
  designType?: string;
  hasReference: boolean;
  discovered: DiscoveredPage[];
  confirmedPages: string[];
  sitemap: CanvasPage[];
  wireframe: WireframePage[];
  style: StyleGuide;
  previewExists: boolean;
  producedFiles: string[];
  exportHref: string;
  actions: Actions;
}) {
  const { run, pending, error } = useAction();
  const Approve = ({ stage, label }: { stage: string; label: string }) => (
    <Button size="sm" disabled={pending} onClick={() => run(() => actions.approveStage(stage))}>
      {pending ? "Saving…" : label}
    </Button>
  );

  if (id === "brand") {
    return (
      <div className="grid gap-4">
        <p className="text-[13px] text-body">
          Generated from your business details, industry, website type, goals, features, pages, and the
          reference sources you provided — plus rendered styles and OpenAI Vision where available.
          Assumptions are flagged only where evidence is missing.
        </p>
        <ul className="grid gap-1 text-[12.5px] text-muted">
          <li>Outputs: BRAND.md · BRAND_GUIDELINES.md · CREATIVE_DIRECTION.md · STYLE_DIRECTION.json</li>
        </ul>
        <div className="flex flex-wrap items-center gap-2.5">
          <ActionDialog
            projectId={projectId}
            trigger="button"
            title={brandExists ? "Regenerate Brand Guideline" : "Generate Brand Guideline"}
            description="The foundation for all later design."
            confirmText="Generate the brand foundation from your brief and the latest reference analysis. Run it now?"
            runName="Brand guideline generation"
            action={actions.generateBrand}
          />
          {brandExists && !brandApproved && (
            <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(actions.approveBrand)}>
              Approve brand guideline
            </Button>
          )}
          {brandApproved && <span className="text-[12px] text-success">✓ Approved — foundation locked in.</span>}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }

  if (id === "crawl") {
    return (
      <CrawlBody
        projectId={projectId}
        hasReference={hasReference}
        discovered={discovered}
        confirmedPages={confirmedPages}
        crawl={actions.crawl}
        confirmPages={actions.confirmPages}
      />
    );
  }

  if (id === "sitemap") {
    return (
      <div className="grid gap-4">
        <p className="text-[13px] text-body">Page structure from confirmed discovered pages + your selected page needs.</p>
        <div className="flex flex-wrap gap-2">
          {sitemap.length ? (
            sitemap.map((p) => (
              <span key={p.name} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] text-ink">
                {p.name}
                <SourceChip source={p.source} />
              </span>
            ))
          ) : (
            <p className="text-[13px] text-muted">Confirm discovered pages first.</p>
          )}
        </div>
        <p className="text-[11.5px] text-faint">Add / remove / reorder / rename lands in the canvas editor — approve to continue.</p>
        <div><Approve stage="sitemap" label="Approve sitemap" /></div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }

  if (id === "wireframe") {
    return (
      <div className="grid gap-4">
        <p className="text-[13px] text-body">Sections per page from detected + reference-inspired structure — never a forced hero/services/FAQ list.</p>
        <div className="grid gap-3">
          {wireframe.length ? (
            wireframe.map((wp) => (
              <div key={wp.page} className="rounded-lg border border-line p-3">
                <p className="text-[12px] font-semibold text-ink">{wp.page}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {wp.sections.map((s, idx) => (
                    <span key={`${s.label}-${idx}`} className="inline-flex items-center gap-1.5 rounded-md bg-panel px-2 py-1 text-[12px] text-body">
                      {s.label}
                      <SourceChip source={s.source} />
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-[13px] text-muted">Run the crawl to detect real sections.</p>
          )}
        </div>
        <div><Approve stage="wireframe" label="Approve wireframe" /></div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }

  if (id === "style") {
    return (
      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <p className="text-[13px] text-body">Style guide from the approved brand{style?.host ? ` + ${style.host}` : ""} + rendered styles.</p>
          {style && <SourceChip source={style.source} />}
        </div>
        {style ? (
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              {style.colors.map((c) => (
                <span key={c.value} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink">
                  <span className="h-4 w-4 rounded-full border border-line" style={{ background: c.value }} />
                  {c.name} <code className="text-faint">{c.value}</code>
                </span>
              ))}
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12.5px] sm:grid-cols-3">
              <Row k="Body font" v={style.bodyFont ?? "—"} />
              <Row k="Display font" v={style.displayFont ?? "—"} />
              <Row k="Body size" v={`${style.bodySizePx}px`} />
              <Row k="Heading weight" v={String(style.headingWeight)} />
              <Row k="Radius" v={`${style.radiusPx}px`} />
              <Row k="Spacing base" v={`${style.spacingPx}px`} />
            </dl>
          </div>
        ) : (
          <p className="text-[13px] text-muted">Crawl the reference site to measure real styles.</p>
        )}
        <div><Approve stage="style" label="Approve style guide" /></div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }

  if (id === "design") {
    return (
      <div className="grid gap-4">
        <p className="text-[13px] text-body">
          The composed design from the approved brand, sitemap, wireframe, and style guide. Choose the design
          type, then preview and approve.
        </p>
        <DesignTypePicker projectId={projectId} current={designType} save={actions.setDesignType} />
        <div className="flex flex-wrap items-center gap-2.5">
          <ActionDialog
            projectId={projectId}
            trigger="button"
            title="Generate Preview"
            description="Render the composed preview from tokens + confirmed structure."
            confirmText="Render the branded desktop/mobile preview from the current tokens and confirmed canvas. Run it now?"
            runName="Preview generation"
            action={actions.generatePreview}
          />
          {previewExists && <span className="text-[12px] text-muted">Preview ready — open the Preview tab for desktop/mobile.</span>}
        </div>
        <div><Approve stage="design" label="Approve design canvas" /></div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }

  if (id === "files") {
    return (
      <div className="grid gap-4">
        <p className="text-[13px] text-body">
          Generate the MD design-system files from the approved canvases. Every value is labelled by source.
        </p>
        <ActionDialog
          projectId={projectId}
          trigger="button"
          title={producedFiles.includes("DESIGN.md") ? "Regenerate Design Files" : "Generate Design Files"}
          description="DESIGN · COMPONENTS · CONTENT · ANIMATION · UX · SEO · PROMPT_CLAUDE_CODE · PROMPT_CODEX"
          confirmText="Generate the MD design-system files from the approved brand and confirmed canvases. Existing files get a new version. Run it now?"
          runName="MD design-system generation"
          action={actions.generateMd}
        />
        {producedFiles.length > 0 && (
          <p className="text-[12px] text-muted">Latest: {producedFiles.join(" · ")} — see the Generated Files tab.</p>
        )}
      </div>
    );
  }

  // export
  return (
    <div className="grid gap-4">
      <p className="text-[13px] text-body">Download the full package — brief, analysis, brand, design system, prompts, and preview.</p>
      <ActionDialog
        projectId={projectId}
        trigger="button"
        title="Export ZIP"
        description="Full package for your build tool."
        confirmText="Download the full export package and mark this project as Exported?"
        downloadHref={exportHref}
      />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-line/60 py-0.5">
      <dt className="text-faint">{k}</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  );
}

function CrawlBody({
  projectId,
  hasReference,
  discovered,
  confirmedPages,
  crawl,
  confirmPages,
}: {
  projectId: string;
  hasReference: boolean;
  discovered: DiscoveredPage[];
  confirmedPages: string[];
  crawl: () => Promise<void>;
  confirmPages: (pages: string[]) => Promise<{ error?: string }>;
}) {
  const { run, pending, error } = useAction();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(confirmedPages.length ? confirmedPages : discovered.filter((d) => d.ok).map((d) => d.url)),
  );
  const [manual, setManual] = useState("");

  const toggle = (url: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(url)) n.delete(url);
      else n.add(url);
      return n;
    });

  const addManual = () => {
    const v = manual.trim();
    if (v) setSelected((s) => new Set(s).add(v));
    setManual("");
  };

  return (
    <div className="grid gap-4">
      <p className="text-[13px] text-body">
        The system crawls the primary reference site and discovers important pages automatically. Confirm the
        ones to analyze — remove irrelevant pages, add a URL only if something is missing.
      </p>
      <div className="flex flex-wrap items-center gap-2.5">
        <ActionDialog
          projectId={projectId}
          trigger="button"
          title={discovered.length ? "Re-crawl Reference Site" : "Crawl Reference Site"}
          description="Discover the important pages of the reference site."
          confirmText="Crawl the primary reference site in a real browser, discover its important pages, and measure rendered styles. Run it now?"
          runName="Website analysis run"
          action={crawl}
          disabledNote={hasReference ? undefined : "Add a reference URL to crawl."}
        />
        {discovered.length > 0 && (
          <span className="text-[12px] text-muted">{discovered.length} page{discovered.length === 1 ? "" : "s"} discovered</span>
        )}
      </div>

      {discovered.length > 0 && (
        <div className="grid gap-2">
          {discovered.map((d) => (
            <label key={d.url} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-[13px]">
              <input type="checkbox" checked={selected.has(d.url)} onChange={() => toggle(d.url)} className="accent-accent" />
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium text-ink">{d.title || d.pageType}</span>
                <span className="ml-2 text-faint">{d.url.replace(/^https?:\/\//, "")}</span>
              </span>
              <SourceChip source={d.ok ? "detected" : "assumed"} />
            </label>
          ))}
          <div className="flex gap-2">
            <input
              className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] placeholder:text-faint"
              placeholder="Add a missing page URL (optional)"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addManual();
                }
              }}
            />
            <Button type="button" variant="secondary" size="sm" onClick={addManual}>Add</Button>
          </div>
          <div>
            <Button
              size="sm"
              disabled={pending || selected.size === 0}
              onClick={() => run(() => confirmPages([...selected]))}
            >
              {pending ? "Saving…" : `Confirm ${selected.size} page${selected.size === 1 ? "" : "s"}`}
            </Button>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
