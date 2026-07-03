"use client";

// React Flow sitemap canvas: pan/zoom graph of Project → Home → child pages.
// Node positions are persisted on the canvas so the layout survives reloads.
// TODO(tldraw): if we later need a freeform design canvas (arbitrary shapes,
// annotations), evaluate tldraw for the Design tab — not needed here.

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { CanvasPage, CanvasSource } from "@/lib/canvas";

const SOURCE_STYLE: Record<string, string> = {
  extracted: "bg-success-soft text-success",
  detected: "bg-success-soft text-success",
  "vision-detected": "bg-info-soft text-info",
  "reference-inspired": "bg-info-soft text-info",
  "user-added": "bg-accent-soft text-accent",
  "AI-suggested": "bg-warning-soft text-warning",
  assumed: "bg-panel text-muted",
};

type PageData = {
  page: CanvasPage;
  isHome: boolean;
  onRename: (id: string, name: string) => void;
  onCycleSource: (id: string) => void;
  onRemove: (id: string) => void;
  onOpen: (id: string) => void;
};

function ProjectNode() {
  return (
    <div className="rounded-md bg-line/70 px-4 py-1.5 text-center text-[12px] font-medium text-body">
      ▦ Project
      <Handle type="source" position={Position.Bottom} className="!bg-line-strong" />
    </div>
  );
}

function PageNode({ data }: NodeProps) {
  const d = data as unknown as PageData;
  const { page, isHome } = d;
  return (
    <div className={`rounded-lg border border-line bg-surface shadow-sm ${isHome ? "w-60" : "w-44"}`}>
      <Handle type="target" position={Position.Top} className="!bg-line-strong" />
      <div className="flex items-center gap-1.5 rounded-t-lg bg-panel px-2 py-1.5">
        <span className="text-[12px]">{isHome ? "🏠" : "📄"}</span>
        <input
          value={page.name}
          onChange={(e) => d.onRename(page.id, e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[12px] font-semibold text-ink outline-none nodrag"
        />
        {!isHome && (
          <button type="button" onClick={() => d.onRemove(page.id)} title="Remove" className="nodrag text-faint hover:text-danger">
            ✕
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 p-2">
        <button
          type="button"
          onClick={() => d.onCycleSource(page.id)}
          title="Change source label"
          className={`nodrag rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_STYLE[page.source] ?? "bg-panel text-muted"}`}
        >
          {page.source}
        </button>
        <button type="button" onClick={() => d.onOpen(page.id)} className="nodrag text-[11px] font-medium text-accent hover:underline">
          {page.sections.length} sec →
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-line-strong" />
    </div>
  );
}

const nodeTypes = { project: ProjectNode, page: PageNode };

/** Layout: project top-center, home under it, children spread in a row. */
function layout(pages: CanvasPage[], handlers: Omit<PageData, "page" | "isHome">): { nodes: Node[]; edges: Edge[] } {
  const home = pages.find((p) => /^home$/i.test(p.name)) ?? pages[0];
  const children = pages.filter((p) => p.id !== home?.id);
  const centerX = Math.max(240, (children.length * 200) / 2);

  const nodes: Node[] = [
    { id: "project", type: "project", position: { x: centerX, y: 0 }, data: {}, draggable: false, selectable: false },
  ];
  const edges: Edge[] = [];

  if (home) {
    nodes.push({
      id: home.id,
      type: "page",
      position: { x: home.x ?? centerX, y: home.y ?? 90 },
      data: { page: home, isHome: true, ...handlers },
    });
    edges.push({ id: `e-project-${home.id}`, source: "project", target: home.id });
  }
  children.forEach((p, i) => {
    nodes.push({
      id: p.id,
      type: "page",
      position: { x: p.x ?? i * 200, y: p.y ?? 300 },
      data: { page: p, isHome: false, ...handlers },
    });
    if (home) edges.push({ id: `e-${home.id}-${p.id}`, source: home.id, target: p.id });
  });
  return { nodes, edges };
}

export function SitemapFlow({
  pages,
  onRename,
  onCycleSource,
  onRemove,
  onOpen,
  onMove,
}: {
  pages: CanvasPage[];
  onRename: (id: string, name: string) => void;
  onCycleSource: (id: string) => void;
  onRemove: (id: string) => void;
  onOpen: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}) {
  const handlers = useMemo(() => ({ onRename, onCycleSource, onRemove, onOpen }), [onRename, onCycleSource, onRemove, onOpen]);
  const initial = useMemo(() => layout(pages, handlers), [pages, handlers]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  // Rebuild when the page structure changes (ids/names/sources/section counts),
  // preserving live positions from React Flow state.
  const signature = pages.map((p) => `${p.id}:${p.name}:${p.source}:${p.sections.length}`).join("|");
  useEffect(() => {
    const built = layout(pages, handlers);
    setNodes(built.nodes);
    setEdges(built.edges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const onNodeDragStop = useCallback(
    (_e: unknown, node: Node) => {
      if (node.id !== "project") onMove(node.id, Math.round(node.position.x), Math.round(node.position.y));
    },
    [onMove],
  );

  return (
    <div className="h-[70vh] w-full rounded-xl border border-line bg-canvas-grid">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep", style: { stroke: "var(--color-line-strong)" } }}
      >
        <Background color="var(--color-line)" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
