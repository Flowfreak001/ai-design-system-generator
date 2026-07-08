"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;

const STAGES = ["Brief", "Brand", "Wireframe", "Export"];

/* ── Centered hero ── */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* gradient canvas surface */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(55% 48% at 80% 20%, color-mix(in srgb, var(--color-accent) 28%, transparent), transparent 62%)," +
            "radial-gradient(52% 46% at 12% 80%, color-mix(in srgb, #6366f1 22%, transparent), transparent 62%)," +
            "radial-gradient(62% 52% at 50% 2%, color-mix(in srgb, #38bdf8 18%, transparent), transparent 68%)," +
            "linear-gradient(180deg, color-mix(in srgb, var(--color-accent) 7%, var(--color-canvas)), var(--color-canvas))",
        }}
      />
      {/* canvas dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--color-ink) 22%, transparent) 1.2px, transparent 1.2px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(85% 78% at 50% 40%, #000 55%, transparent 92%)",
          WebkitMaskImage: "radial-gradient(85% 78% at 50% 40%, #000 55%, transparent 92%)",
        }}
      />
      {/* bottom fade so the hero sits on a soft canvas edge */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-b from-transparent to-canvas" />
      <div className="relative z-10 mx-auto max-w-[900px] px-5 pt-32 pb-16 text-center sm:px-12 sm:pt-40 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}
        >
          <Link
            href="/#product"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-4 text-[13px] font-medium text-body shadow-[0_6px_20px_-12px_rgba(15,23,42,0.3)] transition-colors hover:text-ink"
          >
            <span className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wide text-accent">New</span>
            AI Website Studio is now in Beta
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.06 }}
          className="mx-auto mt-8 max-w-[13ch] font-bold tracking-tight text-[clamp(2.4rem,5.2vw,3.6rem)] leading-[1.02] sm:max-w-[18ch]"
        >
          Design websites faster with <span className="text-accent">AI</span> and reusable components<span className="text-accent">.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.14 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted"
        >
          Turn a client brief into brand guidelines, sitemaps, wireframes, component-based
          page designs, and export-ready prompts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <LinkButton href="/signup" size="lg">
            Start Building
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="-mr-0.5"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </LinkButton>
          <LinkButton href="/#library" variant="secondary" size="lg">Explore Library</LinkButton>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Collaborative "shared canvas" showcase (Miro-style board) ── */
/* Floating collaborator cursor + name tag */
function Cursor({ name, color, text = "#111", className = "" }: { name: string; color: string; text?: string; className?: string }) {
  return (
    <div className={`absolute z-40 flex items-center gap-1 ${className}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill={color} style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))" }}>
        <path d="M4 2l7 18 2.5-7L21 10.5 4 2z" />
      </svg>
      <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ backgroundColor: color, color: text }}>{name}</span>
    </div>
  );
}

type Float = (delay: number, dist?: number) => Record<string, unknown> | undefined;
type Dash = Record<string, unknown>;

/* A card node placed by explicit geometry (% of the stage) so connectors can
   anchor to its exact edges — keeps everything scale-invariant / responsive. */
type Side = "l" | "r" | "t" | "b";
type Node = { x: number; y: number; w: number; h: number; z?: number; dist?: number; el: React.ReactNode };
type Edge = [from: number, fromSide: Side, to: number, toSide: Side];

function anchor(n: Node, s: Side): [number, number] {
  if (s === "r") return [n.x + n.w, n.y + n.h / 2];
  if (s === "l") return [n.x, n.y + n.h / 2];
  if (s === "t") return [n.x + n.w / 2, n.y];
  return [n.x + n.w / 2, n.y + n.h];
}
function edgePath(a: Node, as: Side, b: Node, bs: Side): string {
  const [x1, y1] = anchor(a, as);
  const [x2, y2] = anchor(b, bs);
  const horiz = as === "l" || as === "r";
  const c1: [number, number] = horiz ? [(x1 + x2) / 2, y1] : [x1, (y1 + y2) / 2];
  const c2: [number, number] = horiz ? [(x1 + x2) / 2, y2] : [x2, (y1 + y2) / 2];
  return `M${x1} ${y1} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${x2} ${y2}`;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 inline-flex items-center gap-1 rounded-md bg-panel px-1.5 py-0.5 text-[clamp(7px,1.1vw,9px)] font-semibold text-body">{children}</span>
  );
}

/* Generic board renderer: draws connectors first, then the geometry cards. */
function Board({ float, dash, nodes, edges, children }: { float: Float; dash: Dash; nodes: Node[]; edges: Edge[]; children?: React.ReactNode }) {
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {edges.map((e, i) => (
          <motion.path key={i} d={edgePath(nodes[e[0]], e[1], nodes[e[2]], e[3])} fill="none" stroke="var(--color-accent)" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="0.5 4" vectorEffect="non-scaling-stroke" {...dash} />
        ))}
      </svg>
      {nodes.map((n, i) => (
        <motion.div
          key={i}
          {...float(0.2 + i * 0.14, n.dist ?? 6)}
          style={{ left: `${n.x}%`, top: `${n.y}%`, width: `${n.w}%`, height: `${n.h}%`, zIndex: n.z ?? 10 }}
          className="absolute overflow-hidden rounded-xl border border-line bg-surface p-2 shadow-[0_22px_54px_-30px_rgba(15,23,42,0.5)]"
        >
          {n.el}
        </motion.div>
      ))}
      {children}
    </>
  );
}

const line = (w: string) => <div className="rounded-full bg-panel" style={{ width: w, height: 4 }} />;
const tag = (t: string, c: string) => <span key={t} className="rounded-[4px] px-1.5 py-1 text-[clamp(6.5px,1vw,8px)] font-semibold text-black/70" style={{ backgroundColor: c }}>{t}</span>;

/* 1 · Brief — brief → references, pages, goals */
function BriefBoard({ float, dash }: { float: Float; dash: Dash }) {
  const nodes: Node[] = [
    { x: 3, y: 14, w: 31, h: 60, el: (<><Chip><svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14H7z" stroke="currentColor" strokeWidth="2" /></svg>Client Brief</Chip><div className="space-y-[6px]">{["100%","90%","76%","94%","62%","84%"].map((w,i)=><div key={i}>{line(w)}</div>)}</div></>) },
    { x: 40, y: 14, w: 24, h: 40, z: 12, dist: 7, el: (<><Chip>Reference</Chip><div className="grid aspect-[4/3] place-items-center rounded-lg bg-panel"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="14" rx="2" stroke="var(--color-muted)" strokeWidth="1.6" /><path d="M3 9h18" stroke="var(--color-muted)" strokeWidth="1.6" /></svg></div></>) },
    { x: 70, y: 13, w: 27, h: 34, dist: 8, el: (<><Chip>Goals</Chip><div className="flex flex-wrap gap-1">{[["Leads","#FDE68A"],["Bookings","#BFDBFE"],["Calls","#A7F3D0"],["SEO","#FBCFE8"]].map(([t,c])=>tag(t,c))}</div></>) },
    { x: 55, y: 60, w: 30, h: 34, dist: 6, el: (<><Chip>Pages</Chip><div className="space-y-[5px]">{["Home","Services","About","Contact"].map((p)=><div key={p} className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-accent" /><span className="text-[clamp(7px,1.1vw,9px)] font-medium text-body">{p}</span></div>)}</div></>) },
  ];
  const edges: Edge[] = [[0,"r",1,"l"],[1,"r",2,"l"],[0,"r",3,"l"]];
  return (
    <Board float={float} dash={dash} nodes={nodes} edges={edges}>
      <Cursor name="Aisha" color="#86EFAC" className="left-[36%] top-[7%]" />
      <Cursor name="Marco" color="#FDBA74" className="left-[52%] top-[54%]" />
    </Board>
  );
}

/* 2 · Brand — typography → palette → tokens */
function BrandBoard({ float, dash }: { float: Float; dash: Dash }) {
  const nodes: Node[] = [
    { x: 4, y: 15, w: 30, h: 42, el: (<><Chip>Typography</Chip><div className="flex items-end gap-2"><span className="text-[clamp(20px,3.4vw,30px)] font-bold leading-none tracking-tight text-ink">Aa</span><span className="mb-1 text-[clamp(7px,1.1vw,9px)] font-medium text-muted">Inter</span></div><div className="mt-2 space-y-[5px]">{line("80%")}{line("55%")}</div></>) },
    { x: 60, y: 13, w: 36, h: 34, dist: 8, el: (<><Chip>Palette</Chip><div className="flex flex-wrap gap-1.5">{["#E94B6F","#F9A8C4","#111827","#6366F1","#38BDF8","#34D399","#FBBF24","#F97316"].map((c)=><span key={c} className="size-5 rounded-md sm:size-6" style={{ backgroundColor: c }} />)}</div></>) },
    { x: 24, y: 60, w: 48, h: 34, dist: 7, el: (<><Chip>Tokens</Chip><div className="grid grid-cols-2 gap-x-3 gap-y-1">{[["Radius","14px"],["Spacing","8pt"],["Shadow","soft"],["Weight","600"]].map(([k,v])=>(<div key={k} className="flex items-center justify-between text-[clamp(7px,1.1vw,9px)]"><span className="text-muted">{k}</span><span className="font-semibold text-ink">{v}</span></div>))}</div></>) },
  ];
  const edges: Edge[] = [[0,"r",1,"l"],[1,"b",2,"r"]];
  return (
    <Board float={float} dash={dash} nodes={nodes} edges={edges}>
      <Cursor name="Lena" color="#F5D0FE" className="left-[58%] top-[6%]" />
      <Cursor name="Aisha" color="#86EFAC" className="left-[20%] top-[55%]" />
    </Board>
  );
}

/* 3 · Wireframe — sitemap → wireframe → sections */
function WireframeBoard({ float, dash }: { float: Float; dash: Dash }) {
  const nodes: Node[] = [
    { x: 3, y: 14, w: 33, h: 32, el: (<><Chip>Sitemap</Chip><div className="mx-auto mb-1.5 w-1/2 rounded-[4px] bg-panel py-1 text-center text-[clamp(6.5px,1vw,8px)] font-semibold text-body">Home</div><div className="flex justify-center gap-1">{["About","Services","Contact"].map((p)=><span key={p} className="rounded-[4px] bg-panel px-1.5 py-0.5 text-[clamp(6px,0.9vw,7.5px)] font-medium text-body">{p}</span>)}</div></>) },
    { x: 60, y: 12, w: 37, h: 50, dist: 8, el: (<><Chip>Wireframe</Chip><div className="space-y-1.5">{line("100%")}<div className="grid aspect-[16/6] place-items-center rounded-md bg-panel"><div className="h-[5px] w-1/3 rounded-full bg-line" /></div><div className="flex gap-1.5"><div className="h-6 flex-1 rounded-md bg-panel" /><div className="h-6 flex-1 rounded-md bg-panel" /><div className="h-6 flex-1 rounded-md bg-panel" /></div></div></>) },
    { x: 12, y: 62, w: 46, h: 30, dist: 7, el: (<><Chip>Sections</Chip><div className="flex flex-wrap gap-1">{[["Hero","#FDE68A"],["Features","#BFDBFE"],["Pricing","#A7F3D0"],["FAQ","#FBCFE8"],["CTA","#DDD6FE"]].map(([t,c])=>tag(t,c))}</div></>) },
  ];
  const edges: Edge[] = [[0,"r",1,"l"],[1,"b",2,"r"]];
  return (
    <Board float={float} dash={dash} nodes={nodes} edges={edges}>
      <Cursor name="Marco" color="#FDBA74" className="left-[8%] top-[56%]" />
      <Cursor name="Lena" color="#F5D0FE" className="left-[56%] top-[6%]" />
    </Board>
  );
}

/* 4 · Export — export targets → project files → build prompt */
function ExportBoard({ float, dash }: { float: Float; dash: Dash }) {
  const targets: [string, string][] = [["Figma","#F24E1E"],["Webflow","#4353FF"],["React","#61DAFB"],["Prompt Pack","#E94B6F"]];
  const nodes: Node[] = [
    { x: 3, y: 14, w: 33, h: 44, el: (<><Chip>Export to</Chip><div className="space-y-[6px]">{targets.map(([t,c])=>(<div key={t} className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px]" style={{ backgroundColor: c }} /><span className="text-[clamp(7px,1.1vw,9px)] font-medium text-body">{t}</span></div>))}</div></>) },
    { x: 60, y: 12, w: 37, h: 48, dist: 8, el: (<><Chip>Project files</Chip><div className="space-y-[4px]">{["BRAND.md","SITEMAP.md","WIREFRAME.md","SECTIONS.md","BUILD_PROMPT.md"].map((f)=>(<div key={f} className="flex items-center gap-1.5 rounded-[4px] bg-panel px-1.5 py-1"><svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14H7z" stroke="var(--color-muted)" strokeWidth="2" /></svg><span className="font-mono text-[clamp(6px,0.9vw,7.5px)] text-body">{f}</span></div>))}</div></>) },
    { x: 12, y: 62, w: 46, h: 30, dist: 7, el: (<><Chip>Build prompt</Chip><div className="rounded-md bg-ink/95 p-2 font-mono text-[clamp(6px,0.9vw,7.5px)] leading-relaxed text-white/85"><div><span className="text-accent">const</span> site = build(brief)</div><div className="text-white/55">// tokens · sitemap · sections</div><div><span className="text-[#86EFAC]">export</span> default site</div></div></>) },
  ];
  const edges: Edge[] = [[0,"r",1,"l"],[1,"b",2,"r"]];
  return (
    <Board float={float} dash={dash} nodes={nodes} edges={edges}>
      <div className="absolute bottom-[3%] right-[6%] z-40 flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.5)]">
        <span className="grid size-4 place-items-center rounded-full bg-accent text-[9px] font-bold text-white">6</span>
        <span className="text-[clamp(9px,1.2vw,10.5px)] font-semibold text-ink">Export Pack</span>
      </div>
      <Cursor name="Aisha" color="#86EFAC" className="left-[56%] top-[6%]" />
    </Board>
  );
}

const BOARDS = [BriefBoard, BrandBoard, WireframeBoard, ExportBoard];

export function CanvasShowcase() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setActive((i) => (i + 1) % STAGES.length), 2000);
    return () => clearInterval(t);
  }, [reduce]);

  const float = (delay: number, dist = 6) =>
    reduce ? undefined : { animate: { y: [0, -dist, 0] }, transition: { duration: 6 + delay, ease: "easeInOut" as const, repeat: Infinity, delay } };
  const dash = reduce ? {} : { animate: { strokeDashoffset: [0, -14] }, transition: { duration: 1.3, ease: "linear" as const, repeat: Infinity } };

  return (
    <section className="relative overflow-hidden bg-canvas">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(50% 45% at 80% 40%, color-mix(in srgb, var(--color-accent) 8%, transparent), transparent 60%)" }}
      />
      <div className="mx-auto max-w-[1120px] px-5 pb-24 pt-4 sm:px-12 sm:pb-28">
        {/* Animated workflow tabs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto mb-8 flex w-full max-w-[560px] items-center gap-1 rounded-full border border-line bg-surface/90 p-1.5 shadow-[0_16px_44px_-24px_rgba(15,23,42,0.4)] backdrop-blur"
        >
          {STAGES.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setActive(i)}
              className={`relative flex-1 rounded-full px-4 py-2.5 text-[14px] font-semibold transition-colors duration-200 ${
                active === i ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {active === i && (
                <motion.span layoutId="stage-pill" className="absolute inset-0 rounded-full bg-accent-soft" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              <span className="relative z-10">{s}</span>
            </button>
          ))}
        </motion.div>

        {/* Unified canvas panel: text + board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="grid items-center gap-10 rounded-[32px] border border-line bg-surface/40 p-7 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.4)] sm:p-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14"
          style={{
            backgroundImage:
              "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 16%, transparent) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          {/* Left copy */}
          <div>
            <h2 className="font-bold tracking-tight text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.03]">
              One calm canvas for your website workflow.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Plan the site first, then let AI select clean sections from your component
              library. Less clutter. Better structure. Faster drafts.
            </p>
            <div className="mt-9">
              <LinkButton href="/#workflow" size="lg">View workflow</LinkButton>
            </div>
          </div>

        {/* Right collaborative board — swaps per active tab */}
        <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[22px] border border-line bg-canvas/60">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="absolute inset-0"
            >
              {(() => { const Board = BOARDS[active]; return <Board float={float} dash={dash} />; })()}
            </motion.div>
          </AnimatePresence>
        </div>
        </motion.div>
      </div>
    </section>
  );
}
