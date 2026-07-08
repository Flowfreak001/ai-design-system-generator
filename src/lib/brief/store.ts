// Flowfreak Brief — client-side store (localStorage), no DB/auth changes.
// Seeds sample briefs on first load. A tiny pub/sub keeps screens in sync.

"use client";

import type { Brief, InputMethod } from "./types";
import { SAMPLE_BRIEFS } from "./mock";

const KEY = "flowfreak.briefs.v2";
type Listener = () => void;
const listeners = new Set<Listener>();

// Cached snapshots keep useSyncExternalStore referentially stable — recomputed
// only when data actually changes (on write).
let cache: Brief[] | null = null;
let sortedCache: Brief[] | null = null;
const serverSnapshot: Brief[] = [];

function load(): Brief[] {
  if (typeof window === "undefined") return SAMPLE_BRIEFS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SAMPLE_BRIEFS));
      return SAMPLE_BRIEFS;
    }
    return JSON.parse(raw) as Brief[];
  } catch {
    return SAMPLE_BRIEFS;
  }
}

function read(): Brief[] {
  if (cache === null) cache = load();
  return cache;
}

function write(briefs: Brief[]) {
  cache = briefs;
  sortedCache = null;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(briefs));
  listeners.forEach((l) => l());
}

export const briefStore = {
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  list(): Brief[] {
    if (sortedCache === null) {
      sortedCache = [...read()].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    }
    return sortedCache;
  },
  serverList(): Brief[] {
    return serverSnapshot;
  },
  get(id: string): Brief | undefined {
    return read().find((b) => b.id === id);
  },
  create(input: {
    clientName?: string;
    businessName?: string;
    industry?: string;
    inputMethod: InputMethod;
    rawInput?: string;
    transcriptSource?: string;
    guided?: Record<string, string>;
  }): Brief {
    const nowIso = new Date().toISOString();
    const brief: Brief = {
      id: `brief-${Date.now().toString(36)}`,
      clientName: input.clientName || input.guided?.clientName || "Untitled client",
      businessName: input.businessName || input.guided?.businessName || "Untitled business",
      industry: input.industry || input.guided?.industry || "—",
      status: "draft",
      inputMethod: input.inputMethod,
      createdAt: nowIso,
      updatedAt: nowIso,
      rawInput: input.rawInput || "",
      transcriptSource: input.transcriptSource,
      guided: input.guided,
    };
    write([brief, ...read()]);
    return brief;
  },
  update(id: string, patch: Partial<Brief>): Brief | undefined {
    const briefs = read();
    const i = briefs.findIndex((b) => b.id === id);
    if (i === -1) return undefined;
    briefs[i] = { ...briefs[i], ...patch, updatedAt: new Date().toISOString() };
    write(briefs);
    return briefs[i];
  },
  remove(id: string) {
    write(read().filter((b) => b.id !== id));
  },
};
