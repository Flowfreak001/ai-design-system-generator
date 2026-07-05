// One-time seeding of the 10 built-in sections into the editable global catalog
// so they become first-class LibrarySection rows (sourceType "admin") that admins
// can edit in the Studio — no duplicates, every card editable.
//
// Each seed carries a self-contained TSX component (props: { content, theme }) —
// a faithful re-implementation of the shipped section using inline styles + brand
// tokens, so it renders standalone through the sucrase engine.

import { prisma } from "@/lib/db/client";
import { Prisma } from "@/generated/prisma/client";
import { MANUAL_SECTION_LIBRARY } from "./manual-sections";
import { slugify } from "./dynamic-section";

const btns = `
      <div style={{ marginTop: 26, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {content.primaryButtonLabel ? <button style={{ background: theme.accentColor, color: "#fff", padding: "12px 24px", borderRadius: theme.radius, border: 0, fontWeight: 600, fontSize: 15 }}>{content.primaryButtonLabel}</button> : null}
        {content.secondaryButtonLabel ? <button style={{ background: "transparent", color: theme.textColor, padding: "12px 24px", borderRadius: theme.radius, border: "1px solid " + theme.borderColor, fontWeight: 600, fontSize: 15 }}>{content.secondaryButtonLabel}</button> : null}
      </div>`;

const eyebrow = `{content.eyebrow ? <p style={{ color: theme.accentColor, fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>{content.eyebrow}</p> : null}`;

export const BUILTIN_TSX: Record<string, string> = {
  "sec-hero-centered": `export default function Section({ content, theme }) {
  return (
    <section style={{ background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.bodyFont, padding: "96px 24px", textAlign: "center" }}>
      ${eyebrow}
      <h1 style={{ fontFamily: theme.headingFont, fontSize: 52, fontWeight: 800, lineHeight: 1.05, margin: "14px auto", maxWidth: 760 }}>{content.title}</h1>
      <p style={{ color: theme.mutedTextColor, fontSize: 18, lineHeight: 1.6, maxWidth: 560, margin: "0 auto" }}>{content.description}</p>${btns}
    </section>
  );
}`,

  "sec-hero-split": `export default function Section({ content, theme }) {
  return (
    <section style={{ background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.bodyFont, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        <div>
          ${eyebrow}
          <h1 style={{ fontFamily: theme.headingFont, fontSize: 44, fontWeight: 800, lineHeight: 1.1, margin: "12px 0" }}>{content.title}</h1>
          <p style={{ color: theme.mutedTextColor, fontSize: 17, lineHeight: 1.6 }}>{content.description}</p>
          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {content.primaryButtonLabel ? <button style={{ background: theme.accentColor, color: "#fff", padding: "12px 22px", borderRadius: theme.radius, border: 0, fontWeight: 600 }}>{content.primaryButtonLabel}</button> : null}
            {content.secondaryButtonLabel ? <button style={{ background: "transparent", color: theme.textColor, padding: "12px 22px", borderRadius: theme.radius, border: "1px solid " + theme.borderColor, fontWeight: 600 }}>{content.secondaryButtonLabel}</button> : null}
          </div>
        </div>
        <div style={{ background: theme.surfaceColor, border: "1px solid " + theme.borderColor, borderRadius: theme.radius, minHeight: 300 }} />
      </div>
    </section>
  );
}`,

  "sec-hero-dashboard": `export default function Section({ content, theme }) {
  return (
    <section style={{ background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.bodyFont, padding: "80px 24px 0", textAlign: "center" }}>
      ${eyebrow}
      <h1 style={{ fontFamily: theme.headingFont, fontSize: 46, fontWeight: 800, lineHeight: 1.1, margin: "12px auto", maxWidth: 680 }}>{content.title}</h1>
      <p style={{ color: theme.mutedTextColor, fontSize: 17, lineHeight: 1.6, maxWidth: 540, margin: "0 auto" }}>{content.description}</p>${btns}
      <div style={{ maxWidth: 900, margin: "48px auto 0", height: 320, background: theme.surfaceColor, border: "1px solid " + theme.borderColor, borderRadius: "14px 14px 0 0" }} />
    </section>
  );
}`,

  "sec-features-grid": `export default function Section({ content, theme }) {
  const items = content.items || [];
  return (
    <section style={{ background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.bodyFont, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          ${eyebrow}
          <h2 style={{ fontFamily: theme.headingFont, fontSize: 36, fontWeight: 800, margin: "10px 0" }}>{content.title}</h2>
          <p style={{ color: theme.mutedTextColor, fontSize: 16, maxWidth: 520, margin: "0 auto" }}>{content.description}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {items.map((it, i) => (
            <div key={i}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: theme.accentColor, opacity: 0.18, marginBottom: 12 }} />
              <h3 style={{ fontFamily: theme.headingFont, fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{it.title}</h3>
              <p style={{ color: theme.mutedTextColor, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  "sec-features-media-row": `export default function Section({ content, theme }) {
  const items = content.items || [];
  const cols = Math.min(items.length || 3, 3);
  return (
    <section style={{ background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.bodyFont, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          ${eyebrow}
          <h2 style={{ fontFamily: theme.headingFont, fontSize: 34, fontWeight: 800, margin: "10px 0" }}>{content.title}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(" + cols + ", 1fr)", gap: 24 }}>
          {items.map((it, i) => (
            <div key={i} style={{ border: "1px solid " + theme.borderColor, borderRadius: theme.radius, overflow: "hidden" }}>
              <div style={{ height: 150, background: theme.surfaceColor }} />
              <div style={{ padding: 18 }}>
                <h3 style={{ fontFamily: theme.headingFont, fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{it.title}</h3>
                <p style={{ color: theme.mutedTextColor, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{it.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  "sec-services-grid": `export default function Section({ content, theme }) {
  const items = content.items || [];
  return (
    <section style={{ background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.bodyFont, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          ${eyebrow}
          <h2 style={{ fontFamily: theme.headingFont, fontSize: 34, fontWeight: 800, margin: "10px 0" }}>{content.title}</h2>
          <p style={{ color: theme.mutedTextColor, fontSize: 16, maxWidth: 520, margin: "0 auto" }}>{content.description}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {items.map((it, i) => (
            <div key={i} style={{ border: "1px solid " + theme.borderColor, borderRadius: theme.radius, padding: 22 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: theme.accentColor, marginBottom: 14 }} />
              <h3 style={{ fontFamily: theme.headingFont, fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{it.title}</h3>
              <p style={{ color: theme.mutedTextColor, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  "sec-cta-banner": `export default function Section({ content, theme }) {
  return (
    <section style={{ padding: "32px 24px", fontFamily: theme.bodyFont }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", background: theme.accentColor, color: "#fff", borderRadius: 16, padding: "48px 40px", textAlign: "center" }}>
        <h2 style={{ fontFamily: theme.headingFont, fontSize: 32, fontWeight: 800, margin: "0 0 10px" }}>{content.title}</h2>
        <p style={{ fontSize: 16, opacity: 0.92, maxWidth: 520, margin: "0 auto" }}>{content.description}</p>
        <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {content.primaryButtonLabel ? <button style={{ background: "#fff", color: theme.accentColor, padding: "12px 24px", borderRadius: theme.radius, border: 0, fontWeight: 700 }}>{content.primaryButtonLabel}</button> : null}
          {content.secondaryButtonLabel ? <button style={{ background: "transparent", color: "#fff", padding: "12px 24px", borderRadius: theme.radius, border: "1px solid rgba(255,255,255,0.6)", fontWeight: 600 }}>{content.secondaryButtonLabel}</button> : null}
        </div>
      </div>
    </section>
  );
}`,

  "sec-faq-accordion": `export default function Section({ content, theme }) {
  const items = content.items || [];
  return (
    <section style={{ background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.bodyFont, padding: "80px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          ${eyebrow}
          <h2 style={{ fontFamily: theme.headingFont, fontSize: 34, fontWeight: 800, margin: "10px 0" }}>{content.title}</h2>
        </div>
        <div>
          {items.map((it, i) => (
            <div key={i} style={{ borderBottom: "1px solid " + theme.borderColor, padding: "18px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <h3 style={{ fontFamily: theme.headingFont, fontSize: 16, fontWeight: 700, margin: 0 }}>{it.title}</h3>
                <span style={{ color: theme.mutedTextColor, fontSize: 20 }}>+</span>
              </div>
              <p style={{ color: theme.mutedTextColor, fontSize: 14.5, lineHeight: 1.6, margin: "8px 0 0" }}>{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  "sec-contact-form": `export default function Section({ content, theme }) {
  const field = { width: "100%", padding: "11px 13px", borderRadius: theme.radius, border: "1px solid " + theme.borderColor, background: theme.backgroundColor, color: theme.textColor, fontSize: 14, marginBottom: 12, boxSizing: "border-box" };
  return (
    <section style={{ background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.bodyFont, padding: "80px 24px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          ${eyebrow}
          <h2 style={{ fontFamily: theme.headingFont, fontSize: 32, fontWeight: 800, margin: "10px 0" }}>{content.title}</h2>
          <p style={{ color: theme.mutedTextColor, fontSize: 15 }}>{content.description}</p>
        </div>
        <input placeholder="Your name" style={field} />
        <input placeholder="Email address" style={field} />
        <textarea placeholder="Your message" rows={4} style={{ ...field, resize: "vertical" }} />
        <button style={{ width: "100%", background: theme.accentColor, color: "#fff", padding: "12px", borderRadius: theme.radius, border: 0, fontWeight: 600, fontSize: 15 }}>{content.primaryButtonLabel || "Send message"}</button>
      </div>
    </section>
  );
}`,

  "sec-logo-cloud": `export default function Section({ content, theme }) {
  const items = content.items || [];
  return (
    <section style={{ background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.bodyFont, padding: "56px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        {content.eyebrow ? <p style={{ color: theme.mutedTextColor, fontWeight: 600, fontSize: 13, marginBottom: 24 }}>{content.eyebrow}</p> : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", alignItems: "center" }}>
          {items.map((it, i) => (
            <div key={i} style={{ width: 120, height: 44, borderRadius: 8, background: theme.surfaceColor, border: "1px solid " + theme.borderColor, display: "grid", placeItems: "center", color: theme.mutedTextColor, fontSize: 13, fontWeight: 600 }}>{it.title}</div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
};

/** Seed the built-in sections into an agency's catalog once (idempotent). */
export async function seedBuiltinsForAgency(agencyId: string): Promise<void> {
  const first = MANUAL_SECTION_LIBRARY[0];
  const marker = `seed-${agencyId}-${first.id}`;
  if (await prisma.librarySection.findUnique({ where: { id: marker } })) return;

  for (const b of MANUAL_SECTION_LIBRARY) {
    const code = BUILTIN_TSX[b.id];
    if (!code) continue;
    const id = `seed-${agencyId}-${b.id}`;
    if (await prisma.librarySection.findUnique({ where: { id } })) continue;
    await prisma.librarySection.create({
      data: {
        id, agencyId,
        name: b.name, slug: slugify(b.name),
        category: b.category, layoutType: b.layoutType,
        componentName: b.name.replace(/\s+/g, ""),
        sourceType: "admin", status: "ready", visibility: "public", codeMode: "studio-tsx",
        tsxCode: code,
        config: { description: b.description } as unknown as Prisma.InputJsonValue,
        defaultContent: b.defaultContent as unknown as Prisma.InputJsonValue,
        editableFields: b.editableFields, tags: b.tags,
        originality: "Built-in starter section — original design.",
        version: 1, createdBy: null,
      },
    });
  }
}
