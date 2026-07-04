import type { SectionProps } from "../types";
import { resolveTheme, h, b } from "../section-theme";

export default function ListingGrid({ theme, title, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const listings = items?.length ? items : Array.from({ length: 6 }).map((_, i) => ({ title: `Listing ${i + 1}`, description: "Location · category · detail" }));
  return (
    <section className="px-8 py-14" style={{ background: t.backgroundColor }}>
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-bold" style={h(t)}>{title || "Browse listings"}</h2>
        <div className="hidden gap-2 sm:flex">{["Filter", "Sort", "Map"].map((f) => <span key={f} className="px-3 py-1.5 text-[12px]" style={{ background: t.surfaceColor, borderRadius: t.radius, color: t.mutedTextColor }}>{f}</span>)}</div>
      </div>
      <div className={`mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}>
        {listings.map((l, i) => (
          <div key={i} className="overflow-hidden" style={{ background: t.backgroundColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}` }}>
            <div className="h-28 w-full" style={{ background: t.surfaceColor }} />
            <div className="p-4">
              <p className="text-[14px] font-semibold" style={h(t)}>{l.title || `Listing ${i + 1}`}</p>
              <p className="mt-0.5 text-[12.5px]" style={b(t)}>{l.description || "Location · detail"}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
