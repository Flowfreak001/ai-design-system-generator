import type { Stat } from "@/types/flowfreak";

const ACCENT: Record<NonNullable<Stat["accent"]>, string> = {
  blue: "bg-brand-blue",
  pink: "bg-brand-pink",
  purple: "bg-brand-purple",
  orange: "bg-brand-orange",
};

/** Compact metric tile for dashboards. */
export function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        {stat.accent && <span className={`h-2 w-2 rounded-full ${ACCENT[stat.accent]}`} />}
        <p className="text-[12.5px] text-muted">{stat.label}</p>
      </div>
      <p className="mt-1.5 text-[26px] font-semibold tracking-[-0.02em] text-ink">{stat.value}</p>
      {stat.hint && <p className="mt-0.5 text-[12px] text-faint">{stat.hint}</p>}
    </div>
  );
}
