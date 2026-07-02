import { LandingHero } from "@/components/landing/landing-hero";
import { FeatureSection } from "@/components/landing/feature-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { WorkspaceSection } from "@/components/landing/workspace-section";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { ApprovalSection, InfraSection } from "@/components/landing/approval-infra-sections";
import { FinalCTA } from "@/components/landing/final-cta";

export default function Home() {
  return (
    <>
      <LandingHero />
      <FeatureSection />
      <WorkflowSection />
      <WorkspaceSection />
      <UseCasesSection />
      <ApprovalSection />
      <InfraSection />
      <FinalCTA />
    </>
  );
}
