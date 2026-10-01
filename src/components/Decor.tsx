/** Decorative, non-interactive shape that drifts at its own speed while scrolling (see MotionEffects). */
export function Orb({ className = "", speed = 0.12, ring = false, spin = false }: { className?: string; speed?: number; ring?: boolean; spin?: boolean }) {
  return (
    <div aria-hidden="true" data-parallax={speed} className={`pointer-events-none absolute -z-10 ${className}`}>
      <div className={`h-full w-full rounded-full ${ring ? "border border-accent/25" : "bg-gradient-to-br from-accent/20 to-accent-soft/10 blur-[2px]"} ${spin ? "orbit-spin" : ""}`}>
        {ring && <span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-accent/60" />}
      </div>
    </div>
  );
}
