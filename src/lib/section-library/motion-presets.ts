// Motion / interaction presets — reusable, export-ready animation recipes for
// sections and blocks. Framer-Motion-shaped configs + a matching interactionTag
// so a section can declare its motion without hardcoding it. All presets are
// subtle and MUST be gated behind prefers-reduced-motion at render/export time.
//
// Sources (accelerators only): Magic UI + Aceternity patterns, normalized to
// Framer Motion. See docs/COMPONENT_SOURCES.md.

export type MotionPresetId = "fade-up" | "scroll-reveal" | "hover-lift" | "sticky-reveal" | "marquee";

export interface MotionPreset {
  id: MotionPresetId;
  name: string;
  /** Maps to our interactionTags vocabulary. */
  interactionTag: string;
  description: string;
  /** Framer Motion props (spread onto a motion.* element). */
  motion: Record<string, unknown>;
  /** Plain-English export note for the handoff prompts. */
  exportNotes: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: "fade-up",
    name: "Fade Up",
    interactionTag: "subtle-motion",
    description: "Content fades and rises slightly on mount.",
    motion: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: EASE } },
    exportNotes: "Fade + 16px rise on mount, 0.6s ease [0.22,1,0.36,1]. Skip when prefers-reduced-motion.",
  },
  {
    id: "scroll-reveal",
    name: "Scroll Reveal",
    interactionTag: "scroll-reveal",
    description: "Element reveals as it enters the viewport.",
    motion: { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.3 }, transition: { duration: 0.7, ease: EASE } },
    exportNotes: "Reveal on scroll into view (once, 30% threshold). Fade + 24px rise. Reduced-motion: render final state.",
  },
  {
    id: "hover-lift",
    name: "Hover Lift",
    interactionTag: "hover-expand",
    description: "Card lifts and shadows on hover.",
    motion: { whileHover: { y: -4, boxShadow: "0 18px 40px -16px rgba(16,16,20,0.22)" }, transition: { duration: 0.25, ease: EASE } },
    exportNotes: "On hover: translateY(-4px) + soft shadow. Pointer devices only.",
  },
  {
    id: "sticky-reveal",
    name: "Sticky Reveal",
    interactionTag: "sticky-scroll",
    description: "Media stays pinned while content scrolls past.",
    motion: { style: { position: "sticky", top: 0 } },
    exportNotes: "position: sticky inner + tall wrapper; drive progress from getBoundingClientRect. Reduced-motion: static.",
  },
  {
    id: "marquee",
    name: "Marquee",
    interactionTag: "marquee",
    description: "Infinite horizontal scroll strip, pauses on hover.",
    motion: { animate: { x: ["0%", "-50%"] }, transition: { duration: 22, ease: "linear", repeat: Infinity } },
    exportNotes: "Duplicate the track and translate -50% infinitely; pause on hover; respect prefers-reduced-motion.",
  },
];

export const getMotionPreset = (id: string): MotionPreset | undefined => MOTION_PRESETS.find((p) => p.id === id);
