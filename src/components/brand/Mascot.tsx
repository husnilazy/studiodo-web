import { useId, type ReactNode } from "react";

// The STUDIODO mascot: a little camera-robot. A glossy dark screen for a face (two happy arcs), a flash lamp and a shutter button on top,
// strap lugs on the sides, a soft white body. Brand idea "STUDIO..DO": the studio is the place, the mascot is the DO. It captures
// (flash), prints (a polaroid comes out of its belly) and shares (sparkles fly). Pure SVG + CSS (see "Mascot" in globals.css), so it stays
// crisp at any size and costs no image requests. Every animation is switched off by prefers-reduced-motion.

export const SPARKLE = "M0 -12 L3.2 -3.2 L12 0 L3.2 3.2 L0 12 L-3.2 3.2 L-12 0 L-3.2 -3.2 Z";
export const RIM = "#cfc9f3";

export function Defs({ id }: { id: string }) {
  return (
    <defs>
      {/* soft 3D body: bright top-left, lavender shade bottom-right */}
      <linearGradient id={`${id}-body`} x1="44" y1="60" x2="200" y2="214" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.5" stopColor="#f3f1ff" />
        <stop offset="1" stopColor="#bdb6ee" />
      </linearGradient>
      <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1b1b30" />
        <stop offset="1" stopColor="#05050c" />
      </linearGradient>
      <linearGradient id={`${id}-lamp`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe6ad" />
        <stop offset="1" stopColor="#ffb040" />
      </linearGradient>
      <clipPath id={`${id}-clip`}><rect x="60" y="78" width="120" height="108" rx="40" /></clipPath>
      <radialGradient id={`${id}-glow`}>
        <stop offset="0" stopColor="#ffd37a" stopOpacity="0.95" />
        <stop offset="1" stopColor="#ffd37a" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** The head, drawn in a 240x240 box. `flashKey` > 0 restarts one camera-flash burst each time it changes. */
export function Head({ id, flashKey = 0, screen, sceneOn = false }: { id: string; flashKey?: number; screen?: ReactNode; sceneOn?: boolean }) {
  return (
    <g transform="rotate(-6 120 130)">
      {/* shutter button (top right): reads as "camera" at a glance */}
      <rect x="152" y="50" width="26" height="12" rx="4" fill="#2b2744" />
      <rect x="154" y="41" width="22" height="12" rx="5" fill="#5b5588" />
      <rect x="157" y="43" width="12" height="3" rx="1.5" fill="#fff" opacity="0.45" />
      {/* flash lamp (top left of centre), tilted a little */}
      <g className="m-lamp" transform="rotate(-5 96 44)">
        <circle key={flashKey} className={flashKey ? "m-burst" : "m-glow"} cx="96" cy="42" r="46" fill={`url(#${id}-glow)`} />
        <rect x="84" y="50" width="24" height="12" rx="4" fill="#2b2744" />
        <rect x="64" y="22" width="64" height="31" rx="13" fill={`url(#${id}-lamp)`} />
        <rect x="71" y="26" width="50" height="6" rx="3" fill="#fff" opacity="0.65" />
        <rect x="82" y="35" width="3" height="13" rx="1.5" fill="#fff" opacity="0.4" />
        <rect x="94.5" y="35" width="3" height="13" rx="1.5" fill="#fff" opacity="0.4" />
        <rect x="107" y="35" width="3" height="13" rx="1.5" fill="#fff" opacity="0.4" />
      </g>
      {/* strap lugs */}
      <rect x="26" y="108" width="22" height="36" rx="10" fill="#e7e4fb" stroke={RIM} strokeWidth="2" />
      <rect x="192" y="108" width="22" height="36" rx="10" fill="#cfc9f3" stroke={RIM} strokeWidth="2" />
      {/* body */}
      <rect x="38" y="58" width="164" height="150" rx="54" fill={`url(#${id}-body)`} stroke={RIM} strokeWidth="2.5" />
      <ellipse cx="82" cy="80" rx="28" ry="10" fill="#fff" opacity="0.85" transform="rotate(-24 82 80)" />
      {/* screen with a light bezel and a glossy streak */}
      <rect x="55" y="73" width="130" height="118" rx="44" fill="#e9e6fa" />
      <rect x="60" y="78" width="120" height="108" rx="40" fill={`url(#${id}-screen)`} />
      {/* the screen can show something else (the camera view) instead of the face: it fades in and out with the session */}
      {screen && <g clipPath={`url(#${id}-clip)`} className="rb-scene" style={{ opacity: sceneOn ? 1 : 0 }}>{screen}</g>}
      <path d="M76 98 q28 -24 68 -21 l-6 13 q-32 -3 -56 14 z" fill="#fff" opacity="0.08" />
      <g className="m-eyes" style={screen ? { opacity: sceneOn ? 0 : 1, transition: "opacity 0.3s" } : undefined}>
        <path d="M84 142 q12 -22 24 0" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
        <path d="M132 142 q12 -22 24 0" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
      </g>
      <path className="m-spark" d={SPARKLE} transform="translate(160 102) scale(0.9)" fill="#fff" style={screen ? { opacity: sceneOn ? 0 : 0.9, transition: "opacity 0.3s" } : undefined} />
    </g>
  );
}

/** Just the head, as an inline logo or a character that peeks over a ledge. `flashKey` > 0 plays one camera-flash burst per change. */
export function MascotHead({ className = "", flashKey = 0, title }: { className?: string; flashKey?: number; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="16 14 208 204" className={`mascot ${className}`} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <Defs id={id} />
      <g className="m-float"><Head id={id} flashKey={flashKey} /></g>
    </svg>
  );
}

/** Small square logomark for the navbar / footer: the head only, calm unless hovered (see .m-logo in globals.css). */
export function Logomark({ size = 34 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="16 14 208 204" width={size} height={size} className="mascot m-logo" aria-hidden="true">
      <Defs id={id} />
      <Head id={id} />
    </svg>
  );
}

/**
 * The signature loop, with the whole character: Capture (the lamp flashes), Print (a polaroid comes out of its belly and into its hand),
 * Share (it flies off in sparkles), with a caption that changes in step. One 8 s CSS timeline drives everything so the pieces never drift.
 */
export function MascotDo({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`m-do relative mx-auto w-full max-w-[320px] select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 300 310" className="mascot block w-full">
        <Defs id={id} />
        <ellipse cx="150" cy="296" rx="82" ry="9" fill="#000" opacity="0.1" />
        {/* legs and chunky shoes */}
        <rect x="124" y="236" width="14" height="30" rx="6" fill="#2b2744" />
        <rect x="162" y="236" width="14" height="30" rx="6" fill="#2b2744" />
        <ellipse cx="124" cy="276" rx="28" ry="13" fill="#fff" stroke={RIM} strokeWidth="2" />
        <ellipse cx="176" cy="276" rx="28" ry="13" fill="#fff" stroke={RIM} strokeWidth="2" />
        <rect x="98" y="283" width="52" height="5" rx="2.5" fill="#cfc9f3" />
        <rect x="150" y="283" width="52" height="5" rx="2.5" fill="#cfc9f3" />
        {/* torso with the print slot */}
        <rect x="100" y="166" width="100" height="78" rx="30" fill={`url(#${id}-body)`} stroke={RIM} strokeWidth="2.5" />
        <rect x="126" y="206" width="48" height="8" rx="4" fill="#2b2744" />
        <rect className="m-slot" x="130" y="209" width="40" height="2.5" rx="1.25" fill="#ffd37a" />
        {/* arms: the left one holds the photo, the right one rests */}
        <path d="M104 196 q-24 2 -34 18" fill="none" stroke="#fff" strokeWidth="15" strokeLinecap="round" />
        <path d="M104 196 q-24 2 -34 18" fill="none" stroke={RIM} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M196 196 q22 8 24 34" fill="none" stroke="#fff" strokeWidth="15" strokeLinecap="round" />
        <circle cx="220" cy="234" r="12" fill="#fff" stroke={RIM} strokeWidth="2" />
        {/* the head, tucked onto the torso */}
        <g transform="translate(36 -6) scale(0.87)">
          <g className="m-float"><Head id={id} /></g>
        </g>
        {/* the polaroid: printed at the belly, handed to the left hand, then shared */}
        <g transform="translate(66 206) rotate(-9)">
          <g className="m-photo">
            <rect x="-30" y="-34" width="60" height="70" rx="6" fill="#fff" stroke={RIM} strokeWidth="2" />
            <rect x="-24" y="-28" width="48" height="46" rx="3.5" fill="#0a0a14" />
            <path className="m-spark" d={SPARKLE} transform="translate(0 -5) scale(1.1)" fill="#fff" />
            <rect x="-14" y="24" width="28" height="5" rx="2.5" fill="#d9d4fb" />
          </g>
        </g>
        <circle cx="62" cy="216" r="13" fill="#fff" stroke={RIM} strokeWidth="2" />
        {/* share sparkles */}
        <g className="m-share">
          <path d={SPARKLE} transform="translate(222 96) scale(1)" fill="#7b78ff" />
          <path d={SPARKLE} transform="translate(250 138) scale(0.6)" fill="#ff8fb8" />
          <path d={SPARKLE} transform="translate(200 62) scale(0.55)" fill="#ffc46b" />
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
