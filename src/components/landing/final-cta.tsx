import { FadeUp } from "@/components/ui/motion";
import { LinkButton } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 pb-28">
      <FadeUp className="relative overflow-hidden rounded-3xl border border-line-strong px-8 py-16 text-center md:py-20">
        <div className="aurora pointer-events-none absolute inset-0 -z-10 opacity-80" />
        <p className="eyebrow">Start now</p>
        <h2 className="mx-auto mt-4 max-w-2xl font-bold tracking-tight text-[clamp(2rem,4vw,3.2rem)] leading-[1.05]">
          Give your next site an <span className="text-gradient">intelligent</span> foundation.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Create a project, enter your brief, and generate an AI-ready design
          system in minutes.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/projects/new" size="lg">
            Create a project
          </LinkButton>
          <LinkButton href="/projects" variant="secondary" size="lg">
            View projects
          </LinkButton>
        </div>
      </FadeUp>
    </section>
  );
}
