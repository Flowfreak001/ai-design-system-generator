"use client";

// Command/history stack over the pages tree for the visual editor. Every mutation
// goes through `commit(next)` which snapshots the previous state; `undo`/`redo`
// walk the stacks. Autosave is handled separately (debounced) by the shell so we
// never write to the DB per keystroke.

import { useCallback, useState } from "react";
import type { ShopifyPage } from "@/modules/shopify";

const MAX_HISTORY = 60;

export function useEditorHistory(initial: ShopifyPage[]) {
  const [pages, setPages] = useState<ShopifyPage[]>(initial);
  const [past, setPast] = useState<ShopifyPage[][]>([]);
  const [future, setFuture] = useState<ShopifyPage[][]>([]);

  const commit = useCallback((next: ShopifyPage[]) => {
    setPast((p) => [...p, pages].slice(-MAX_HISTORY));
    setFuture([]);
    setPages(next);
  }, [pages]);

  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [pages, ...f].slice(0, MAX_HISTORY));
      setPages(prev);
      return p.slice(0, -1);
    });
  }, [pages]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const nextState = f[0];
      setPast((p) => [...p, pages].slice(-MAX_HISTORY));
      setPages(nextState);
      return f.slice(1);
    });
  }, [pages]);

  return { pages, commit, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}
