import { useId } from "react";

// The STUDIODO mascot: a little camera-robot. A dark screen for a face (two happy arcs), a flash lamp on top, white body.
// Brand idea "STUDIO..DO": the studio is the place, the mascot is the DO. It captures (flash), prints (a polaroid slides out) and
// shares (sparkles fly). Pure SVG + CSS (see "Mascot" in globals.css), so it stays crisp at any size and costs no image requests.
// Every animation is switched off by prefers-reduced-motion.

const SPARKLE = "M0 -12 L3.2 -3.2 L12 0 L3.2 3.2 L0 12 L-3.2 3.2 L-12 0 L-3.2 -3.2 Z";

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-body`} x1="40" y1="60" x2="200" y2="210" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.6" stopColor="#f0eeff" />
        <stop offset="1" stopColor="#d9d4fb" />
      </linearGradient>
      <linearGradient id={`${id}-lamp`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe3a3" />
        <stop offset="1" stopColor="#ffb54a" />
      </linearGradient>
      <radialGradient id={`${id}-glow`}>
        <stop offset="0" stopColor="#ffd37a" stopOpacity="0.95" />
        <stop offset="1" stopColor="#ffd37a" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** The head, drawn in a 240x240 box. `still` freezes the idle loop (used where motion would distract, e.g. tiny favicons). */
function Head({ id, flashKey = 0 }: { id: string; flashKey?: number }) {
  return (
    <g transform="rotate(-6 120 130)">
      <g className="m-lamp">
        {/* key restarts the one-shot burst each time the parent flashes */}
        <circle key={flashKey} className={flashKey ? "m-burst" : "m-glow"} cx="120" cy="43" r="46" fill={`url(#${id}-glow)`} />
        <rect x="86" y="30" width="68" height="26" rx="13" fill={`url(#${id}-lamp)`} />
        <rect x="94" y="34" width="52" height="7" rx="3.5" fill="#fff" opacity="0.6" />
      </g>
      <rect x="102" y="52" width="36" height="14" rx="5" fill="#2b2744" />
      <rect x="38" y="58" width="164" height="150" rx="54" fill={`url(#${id}-body)`} stroke="#cfc9f3" strokeWidth="2.5" />
      <rect x="58" y="76" width="124" height="112" rx="40" fill="#0a0a14" />
      <rect x="58" y="76" width="124" height="112" rx="40" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="2" />
      <g className="m-eyes">
        <path d="M84 142 q12 -22 24 0" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
        <path d="M132 142 q12 -22 24 0" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
      </g>
      <path className="m-spark" d={SPARKLE} transform="translate(160 100) scale(0.9)" fill="#fff" opacity="0.9" />
    </g>
  );
}

/** Just the head, as an inline logo or a character that peeks over a ledge. `flashKey` > 0 plays one camera-flash burst per change. */
export function MascotHead({ className = "", flashKey = 0, title }: { className?: string; flashKey?: number; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="20 18 200 200" className={`mascot ${className}`} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <Defs id={id} />
      <g className="m-float"><Head id={id} flashKey={flashKey} /></g>
    </svg>
  );
}

/** Small square logomark for the navbar / footer: the head only, calm unless hovered (see .m-logo in globals.css). */
export function Logomark({ size = 34 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="20 18 200 200" width={size} height={size} className="mascot m-logo" aria-hidden="true">
      <Defs id={id} />
      <Head id={id} />
    </svg>
  );
}

/**
 * The signature loop: Capture (flash), Print (a polaroid slides out), Share (it flies off in sparkles), with a caption that changes in step.
 * One 8 s CSS timeline drives everything so the pieces can never drift apart.
 */
export function MascotDo({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`m-do relative mx-auto w-full max-w-[320px] select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 300 300" className="mascot block w-full">
        <Defs id={id} />
        <ellipse cx="150" cy="276" rx="78" ry="9" fill="#000" opacity="0.1" />
        <g transform="translate(30 20) scale(0.95)">
          <g className="m-float"><Head id={id} /></g>
        </g>
        {/* the polaroid: printed out of the front, then shared */}
        <g className="m-photo">
          <g transform="translate(0 12) rotate(7 150 236)">
            <rect x="106" y="190" width="88" height="96" rx="7" fill="#fff" stroke="#cfc9f3" strokeWidth="2" />
            <rect x="115" y="199" width="70" height="60" rx="4" fill="#0a0a14" />
            <path d={SPARKLE} transform="translate(150 229) scale(1.4)" fill="#fff" className="m-spark" />
            <rect x="124" y="268" width="38" height="6" rx="3" fill="#d9d4fb" />
          </g>
        </g>
        {/* little hands, always on top */}
        <circle cx="96" cy="246" r="15" fill="#fff" stroke="#cfc9f3" strokeWidth="2" />
        <circle cx="204" cy="246" r="15" fill="#fff" stroke="#cfc9f3" strokeWidth="2" />
        {/* share sparkles */}
        <g className="m-share">
          <path d={SPARKLE} transform="translate(214 110) scale(1)" fill="#7b78ff" />
          <path d={SPARKLE} transform="translate(236 150) scale(0.6)" fill="#ff8fb8" />
          <path d={SPARKLE} transform="translate(196 80) scale(0.55)" fill="#ffc46b" />
        </g>
      </svg>
      <div className="relative mt-1 h-8 text-center font-display text-xl font-semibold tracking-tight">
        <span className="m-cap m-cap-1 absolute inset-0">Capture.</span>
        <span className="m-cap m-cap-2 absolute inset-0">Print.</span>
        <span className="m-cap m-cap-3 absolute inset-0">Share.</span>
      </div>
    </div>
  );
}

/** The "studiodo" wordmark with the sparkle. "studio" settles in, then "do" pops and the sparkle twinkles: the DO moment. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`m-word inline-flex items-start font-display font-semibold lowercase tracking-[-0.03em] ${className}`}>
      <span className="m-word-studio">studio</span>
      <span className="m-word-do">do</span>
      <svg viewBox="-14 -14 28 28" className="m-word-spark -ml-0.5 -mt-1 h-[0.55em] w-[0.55em] text-accent" aria-hidden="true">
        <path d={SPARKLE} fill="currentColor" />
      </svg>
    </span>
  );
}
