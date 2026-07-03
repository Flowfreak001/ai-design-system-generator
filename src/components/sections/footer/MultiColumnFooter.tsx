import type { SectionProps } from "../types";
import { resolveTheme } from "../section-theme";

export default function MultiColumnFooter({ theme, title, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const cols = [
    { head: "Product", links: ["Features", "Pricing", "Integrations"] },
    { head: "Company", links: ["About", "Careers", "Contact"] },
    { head: "Resources", links: ["Blog", "Guides", "Support"] },
    { head: "Legal", links: ["Privacy", "Terms", "Cookies"] },
  ];
  return (
    <footer className="px-8 py-14" style={{ background: t.primaryColor }}>
      <div className={`grid gap-8 ${mobile ? "grid-cols-2" : "grid-cols-5"}`}>
        <div className={mobile ? "col-span-2" : ""}>
          <p className="text-[16px] font-bold" style={{ fontFamily: t.headingFont, color: "#ffffff" }}>{title || "Company"}</p>
          <p className="mt-2 text-[12.5px]" style={{ color: "rgba(255,255,255,0.6)" }}>Helping businesses do more with less.</p>
        </div>
        {cols.map((c) => (
          <div key={c.head}>
            <p className="text-[12.5px] font-semibold" style={{ color: "#ffffff", fontFamily: t.headingFont }}>{c.head}</p>
            <div className="mt-2.5 grid gap-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>{c.links.map((l) => <span key={l}>{l}</span>)}</div>
          </div>
        ))}
      </div>
      <div className="mt-10 border-t pt-5 text-[11.5px]" style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}>© {new Date().getFullYear()} All rights reserved.</div>
    </footer>
  );
}
