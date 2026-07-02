import type { ReactNode } from "react";
import { FadeUp } from "@/components/ui/motion";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  center?: boolean;
}) {
  return (
    <FadeUp className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-bold tracking-tight text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.08]">
        {title}
      </h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>}
    </FadeUp>
  );
}
