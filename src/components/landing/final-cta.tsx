import { FadeUp } from "@/components/ui/motion";
import { LinkButton } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 sm:px-12 py-24 md:py-28">
      <FadeUp className="card relative overflow-hidden px-8 py-16 text-center md:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"
        />
        <h2 className="mx-auto max-w-2xl font-semibold tracking-[-0.025em] text-[clamp(1.9rem,3.6vw,2.8rem)] leading-[1.1]">
          Simple enough to start. Structured enough to deliver.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Create client projects, generate build-ready files, design
          small-business workflows, and keep every approval and handoff
          organized.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/signup" size="lg">
            Start building your workspace
          </LinkButton>
          <LinkButton href="/projects" variant="secondary" size="lg">
            View projects
          </LinkButton>
        </div>
      </FadeUp>
    </section>
  );
}
