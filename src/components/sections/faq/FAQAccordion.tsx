import type { SectionProps } from "../types";
import { resolveTheme, h, b } from "../section-theme";

export default function FAQAccordion({ theme, eyebrow, title, items }: SectionProps) {
  const t = resolveTheme(theme);
  const faqs = items?.length ? items : [
    { question: "How quickly can we get started?", answer: "Most projects kick off within a few days of your first call." },
    { question: "What does pricing look like?", answer: "Transparent, fixed quotes based on your scope — no surprises." },
    { question: "Do you offer ongoing support?", answer: "Yes, we offer flexible support plans after launch." },
    { question: "Can you work with our existing tools?", answer: "We integrate with the tools your team already uses." },
  ];
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <h2 className="text-center text-[26px] font-bold" style={h(t)}>{title || "Frequently asked questions"}</h2>
      {eyebrow && <p className="mt-2 text-center text-[13px]" style={b(t)}>{eyebrow}</p>}
      <div className="mx-auto mt-8 grid max-w-2xl gap-3">
        {faqs.map((f, i) => (
          <div key={i} className="p-4" style={{ background: t.surfaceColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}` }}>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold" style={h(t)}>{f.question || `Question ${i + 1}?`}</span>
              <span className="text-[16px]" style={{ color: t.accentColor }}>{i === 0 ? "−" : "+"}</span>
            </div>
            {i === 0 && f.answer && <p className="mt-2 text-[13px] leading-relaxed" style={b(t)}>{f.answer}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
