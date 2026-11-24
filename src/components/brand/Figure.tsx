import { figureSvg, type Fig } from "@/lib/figures";

/** A reel-style vector character (same art as the Instagram/TikTok reels). Decorative; gently bobs unless reduced motion is on. */
export function Figure({ className = "", bob = true, delay = 0, ...o }: Omit<Fig, "x" | "y" | "s"> & { className?: string; bob?: boolean; delay?: number }) {
  return <div aria-hidden="true" className={`${bob ? "bd-bob" : ""} ${className}`} style={delay ? { animationDelay: `${delay}s` } : undefined} dangerouslySetInnerHTML={{ __html: figureSvg(o) }} />;
}
