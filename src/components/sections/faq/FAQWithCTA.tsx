import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill } from "../section-theme";

export default function FAQWithCTA({ theme, title, description, items, primaryButtonLabel, mobile, assetSide }: SectionProps) {
  const t = resolveTheme(theme);
  const faqs = (items?.length ? items : [
    { question: "How quickly can we get started?" },
    { question: "What does pricing look like?" },
    { question: "Do you offer ongoing support?" },
  ]).slice(0, 4);
  const content = (
    <div>
      <h2 className="text-[24px] font-bold" style={h(t)}>{title || "Frequently asked questions"}</h2>
      <div className="mt-5 grid gap-3">
        {faqs.map((f, i) => (
          <div key={i} className="flex items-center justify-between p-4" style={{ background: t.surfaceColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}` }}>
            <span className="text-[13.5px] font-medium" style={h(t)}>{f.question || `Question ${i + 1}?`}</span>
            <span style={{ color: t.accentColor }}>+</span>
          </div>
        ))}
      </div>
    </div>
  );
  const aside = (
    <div className="flex flex-col justify-center rounded-2xl p-8 text-center" style={{ background: t.primaryColor }}>
      <p className="text-[18px] font-bold" style={{ fontFamily: t.headingFont, color: "#ffffff" }}>Still have questions?</p>
      <p className="mt-2 text-[13px]" style={{ fontFamily: t.bodyFont, color: "rgba(255,255,255,0.8)" }}>{description || "Our team is happy to help — reach out any time."}</p>
      <span className="mx-auto mt-5 inline-block px-5 py-2.5 text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Contact us"}</span>
    </div>
  );
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className={`grid items-stretch gap-10 md:grid-cols-2`}>
        {assetSide === "left" ? <>{aside}{content}</> : <>{content}{aside}</>}
      </div>
    </section>
  );
}
