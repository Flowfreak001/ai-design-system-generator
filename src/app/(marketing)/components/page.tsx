import type { Metadata } from "next";
import { PublicLibrary } from "@/components/library/public-library";
import { getBuiltinLibrarySections } from "@/lib/section-library/builtin-public";

export const metadata: Metadata = {
  title: "Section Library — Flowfreak",
  description: "Browse production-ready, themeable website sections. Headers, heroes, features, pricing, testimonials, footers and more — preview live and export for your stack.",
};

export default function ComponentsPage() {
  const sections = getBuiltinLibrarySections();
  return <PublicLibrary sections={sections} />;
}
