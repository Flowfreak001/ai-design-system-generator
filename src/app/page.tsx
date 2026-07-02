import { LandingHero } from "@/components/landing/landing-hero";
import { FeatureSection } from "@/components/landing/feature-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { OutputFilesSection } from "@/components/landing/output-files-section";
import { PreviewExportSection } from "@/components/landing/preview-export-section";
import { TrustSection } from "@/components/landing/trust-section";
import { FinalCTA } from "@/components/landing/final-cta";

export default function Home() {
  return (
    <>
      <LandingHero />
      <FeatureSection />
      <WorkflowSection />
      <OutputFilesSection />
      <PreviewExportSection />
      <TrustSection />
      <FinalCTA />
    </>
  );
}
