// Flowfreak brand mark — four rounded diagonal dashes with four colour dots
// (blue top · pink left · purple right · orange bottom), redrawn as inline SVG
// so it stays crisp and theme-aware. Pair with the wordmark where there's room.

export function FlowfreakMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      {/* diagonal dashes */}
      <g stroke="currentColor" strokeWidth="3.1" strokeLinecap="round">
        <path d="M7 7 11.4 11.4" />
        <path d="M25 7 20.6 11.4" />
        <path d="M7 25 11.4 20.6" />
        <path d="M25 25 20.6 20.6" />
      </g>
      {/* colour dots on the axes */}
      <circle cx="16" cy="6.6" r="1.9" fill="#38BDF8" />
      <circle cx="6.6" cy="16" r="1.9" fill="#EC4899" />
      <circle cx="25.4" cy="16" r="1.9" fill="#8B5CF6" />
      <circle cx="16" cy="25.4" r="1.9" fill="#F97316" />
    </svg>
  );
}

/** Full lock-up: mark + "Flowfreak" wordmark. */
export function FlowfreakLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <FlowfreakMark className="shrink-0 text-ink" />
      <span className="text-[16px] font-bold tracking-[-0.02em] text-ink">Flowfreak</span>
    </span>
  );
}
