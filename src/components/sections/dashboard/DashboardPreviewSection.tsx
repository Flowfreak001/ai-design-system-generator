import type { SectionProps } from "../types";
import { resolveTheme, h, b } from "../section-theme";

export default function DashboardPreviewSection({ theme, title, items }: SectionProps) {
  const t = resolveTheme(theme);
  const stats = items?.length ? items : [
    { label: "Active users", value: "12.4k" },
    { label: "Revenue", value: "$48.2k" },
    { label: "Conversion", value: "3.8%" },
  ];
  return (
    <section className="px-8 py-14" style={{ background: t.surfaceColor }}>
      <h2 className="mb-6 text-[20px] font-bold" style={h(t)}>{title || "Your dashboard at a glance"}</h2>
      <div className="rounded-2xl p-5" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}`, boxShadow: t.shadow }}>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="p-4" style={{ background: t.surfaceColor, borderRadius: t.radius }}>
              <p className="text-[11.5px]" style={b(t)}>{s.label || `Metric ${i + 1}`}</p>
              <p className="mt-1 text-[24px] font-bold" style={h(t)}>{s.value || "—"}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 h-40 w-full rounded-xl" style={{ background: t.surfaceColor }} />
      </div>
    </section>
  );
}
