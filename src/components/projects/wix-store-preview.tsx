"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { fetchStoreProductsAction } from "@/app/(app)/projects/[id]/wix-actions";
import type { WixProduct } from "@/lib/integrations/wix/stores";

/** Live preview of the connected Wix site's Stores catalog, proving the
 *  per-project catalog read end-to-end before it renders on a generated site. */
export function WixStorePreview({ projectId }: { projectId: string }) {
  const [pending, start] = useTransition();
  const [products, setProducts] = useState<WixProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    start(async () => {
      setError(null);
      const res = await fetchStoreProductsAction(projectId);
      if (res?.error) setError(res.error);
      else setProducts(res?.products ?? []);
    });

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[14px] font-semibold text-ink">Store products</p>
          <p className="mt-0.5 text-[12.5px] text-muted">Live catalog from this project&apos;s connected Wix Store.</p>
        </div>
        <Button variant="secondary" size="sm" disabled={pending} onClick={load}>
          {pending ? "Loading…" : products ? "Refresh" : "Load products"}
        </Button>
      </div>

      {error && <p className="mt-3 text-[12.5px] text-danger">{error}</p>}

      {products && products.length === 0 && !error && (
        <p className="mt-3 text-[12.5px] text-muted">No products found — is Wix Stores installed on the connected site?</p>
      )}

      {products && products.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-line bg-surface">
              <div className="aspect-square bg-panel">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${p.image}/v1/fill/w_320,h_320,q_80/${p.slug}.jpg`} alt={p.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[12.5px] font-medium text-ink">{p.name}</p>
                  {p.ribbon && <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">{p.ribbon}</span>}
                </div>
                <p className="mt-1 text-[12.5px] text-body">
                  <span className="font-semibold text-ink">{p.price}</span>
                  {p.compareAtPrice && <span className="ml-1.5 text-faint line-through">{p.compareAtPrice}</span>}
                  {!p.inStock && <span className="ml-1.5 text-[11px] text-warning">Out of stock</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
