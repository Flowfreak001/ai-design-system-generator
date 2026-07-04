import type { SectionProps } from "../types";
import { resolveTheme, fill } from "../section-theme";

export default function FooterWithNewsletter({ theme, title, subtitle, primaryButtonLabel, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const cols = [
    { head: "Company", links: ["About", "Careers", "Contact"] },
    { head: "Resources", links: ["Blog", "Guides", "Support"] },
  ];
  return (
    <footer className="px-8 py-14" style={{ background: t.primaryColor }}>
      <div className={`grid gap-10 grid-cols-1 md:grid-cols-[2fr_1fr_1fr]`}>
        <div>
          <p className="text-[16px] font-bold" style={{ fontFamily: t.headingFont, color: "#ffffff" }}>{title || "Stay in the loop"}</p>
          <p className="mt-1.5 text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>{subtitle || "Product updates and tips, straight to your inbox. No spam."}</p>
          <div className="mt-4 flex max-w-sm gap-2">
            <div className="h-10 flex-1 rounded-lg" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }} />
            <span className="px-4 py-2.5 text-[12.5px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Subscribe"}</span>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.head}>
            <p className="text-[12.5px] font-semibold" style={{ color: "#ffffff", fontFamily: t.headingFont }}>{c.head}</p>
            <div className="mt-2.5 grid gap-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>{c.links.map((l) => <span key={l}>{l}</span>)}</div>
          </div>
        ))}
      </div>
    </footer>
  );
}
