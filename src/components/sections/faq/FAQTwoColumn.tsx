import type { SectionProps } from "../types";
import { resolveTheme, h, b } from "../section-theme";

export default function FAQTwoColumn({ theme, title, subtitle, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const faqs = items?.length ? items : [
    { question: "How quickly can we start?", answer: "Most projects begin within a few days of the first call." },
    { question: "How is pricing structured?", answer: "Fixed quotes based on scope, agreed up front." },
    { question: "Do you offer support?", answer: "Yes — flexible plans are available after launch." },
    { question: "Which tools do you use?", answer: "We adapt to the stack your team already relies on." },
  ];
  return (
    <section className="px-8 py-16" style={{ background: t.surfaceColor }}>
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[26px] font-bold" style={h(t)}>{title || "Questions & answers"}</h2>
        {subtitle && <p className="mt-2 text-[14px]" style={b(t)}>{subtitle}</p>}
        <div className={`mt-8 grid gap-x-10 gap-y-7 grid-cols-1 md:grid-cols-2`}>
          {faqs.map((f, i) => (
            <div key={i}>
              <p className="text-[14px] font-semibold" style={h(t)}>{f.question || `Question ${i + 1}?`}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={b(t)}>{f.answer || "A concise, helpful answer that removes the objection."}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
