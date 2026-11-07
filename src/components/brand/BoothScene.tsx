import { useId } from "react";

// The picture inside the hero's kiosk screen: two friends in front of a photo backdrop who follow the booth session.
// phase: 0 idle (one waves at the camera) · 1 payment received (both cheer) · 2/3/4 countdown (get ready, peace sign) · 5 flash (eyes shut)
// · 6 photo ready (both pose). Arms are rotated with CSS (see ".bs" in globals.css), so a pose change is a smooth transition.
// `shot` changes the outfits every cycle so each photo shows different people. Pure SVG, no image requests.

const SKIN = ["#f6c9a6", "#e0a47a", "#b9805a", "#f2d0b5"];
const HAIR = ["#2b2233", "#5a3a24", "#1c1c28", "#c9783a"];
const SHIRT = ["#ff7a59", "#2fb7a4", "#7b78ff", "#ffb43a", "#ff6b9a", "#4f8bff"];
const SPARKLE = "M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z";

const POSE = ["wave", "cheer", "ready", "ready", "ready", "flash", "pose"] as const;

function Person({ x, skin, hair, shirt, hairStyle, side }: { x: number; skin: string; hair: string; shirt: string; hairStyle: number; side: "a" | "b" }) {
  return (
    <g transform={`translate(${x} 0)`} className={`bs-person bs-${side}`}>
      {/* arms behind the torso edges; each is a bent stroke starting at the shoulder, rotated by CSS */}
      <g transform="translate(-34 168)"><g className="bs-arm bs-arm-l">
        <path d="M0 0 q5 22 1 44" fill="none" stroke={shirt} strokeWidth="17" strokeLinecap="round" />
        <circle cx="1" cy="50" r="9.5" fill={skin} />
        <g className="bs-peace"><rect x="-5" y="34" width="4.5" height="17" rx="2.2" fill={skin} /><rect x="2.5" y="33" width="4.5" height="18" rx="2.2" fill={skin} /></g>
      </g></g>
      <g transform="translate(34 168) scale(-1 1)"><g className="bs-arm bs-arm-r">
        <path d="M0 0 q5 22 1 44" fill="none" stroke={shirt} strokeWidth="17" strokeLinecap="round" />
        <circle cx="1" cy="50" r="9.5" fill={skin} />
        <g className="bs-peace"><rect x="-5" y="34" width="4.5" height="17" rx="2.2" fill={skin} /><rect x="2.5" y="33" width="4.5" height="18" rx="2.2" fill={skin} /></g>
      </g></g>
      {/* torso */}
      <path d="M-42 330 V210 q0 -44 42 -44 q42 0 42 44 V330 Z" fill={shirt} />
      <path d="M-14 166 q14 22 28 0" fill={skin} />
      {/* hair behind the head (long styles) */}
      {hairStyle === 2 && <path d="M-34 120 q0 -52 34 -52 q34 0 34 52 v40 q-34 12 -68 0 z" fill={hair} />}
      <g className="bs-head">
        <rect x="-9" y="138" width="18" height="30" rx="8" fill={skin} />
        <circle cx="0" cy="116" r="35" fill={skin} />
        {hairStyle === 0 && <path d="M-36 112 q-2 -44 36 -44 q38 0 36 44 q-14 -22 -36 -22 q-22 0 -36 22 z" fill={hair} />}
        {hairStyle === 1 && (<><circle cx="0" cy="72" r="14" fill={hair} /><path d="M-36 112 q-2 -42 36 -42 q38 0 36 42 q-14 -20 -36 -20 q-22 0 -36 20 z" fill={hair} /></>)}
        {hairStyle === 2 && <path d="M-36 112 q-2 -44 36 -44 q38 0 36 44 q-8 -26 -36 -26 q-28 0 -36 26 z" fill={hair} />}
        <circle cx="-23" cy="124" r="6" fill="#ff9d9d" opacity="0.45" />
        <circle cx="23" cy="124" r="6" fill="#ff9d9d" opacity="0.45" />
        <g className="bs-eyes">
          <ellipse cx="-12" cy="114" rx="3.6" ry="4.6" fill="#1b1424" />
          <ellipse cx="12" cy="114" rx="3.6" ry="4.6" fill="#1b1424" />
        </g>
        <path className="bs-smile-s" d="M-8 128 q8 6 16 0" fill="none" stroke="#1b1424" strokeWidth="3" strokeLinecap="round" />
        <path className="bs-smile-b" d="M-11 126 q11 14 22 0 z" fill="#8a2b3c" stroke="#1b1424" strokeWidth="2.4" strokeLinejoin="round" />
      </g>
    </g>
  );
}

export function BoothScene({ phase, shot, className = "" }: { phase: number; shot: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const n = Math.abs(shot);
  const a = { skin: SKIN[n % 4], hair: HAIR[(n + 1) % 4], shirt: SHIRT[n % 6], hairStyle: n % 3 };
  const b = { skin: SKIN[(n + 2) % 4], hair: HAIR[(n + 3) % 4], shirt: SHIRT[(n + 3) % 6], hairStyle: (n + 1) % 3 };
  const pose = POSE[phase] ?? "wave";
  return (
    <svg viewBox="0 0 340 300" preserveAspectRatio="xMidYMax slice" className={`bs absolute inset-0 h-full w-full ${className}`} data-pose={pose} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd9e8" />
          <stop offset="0.55" stopColor="#e3dcff" />
          <stop offset="1" stopColor="#c9e3ff" />
        </linearGradient>
      </defs>
      <rect width="340" height="300" fill={`url(#${id}-bg)`} />
      {/* backdrop: soft shapes and a few sparkles, so the photo reads as a booth backdrop */}
      <circle cx="56" cy="70" r="46" fill="#fff" opacity="0.35" />
      <circle cx="296" cy="96" r="56" fill="#fff" opacity="0.28" />
      <path className="bs-spark" d={SPARKLE} transform="translate(300 40)" fill="#fff" />
      <path className="bs-spark bs-spark-2" d={SPARKLE} transform="translate(38 150) scale(0.7)" fill="#fff" />
      <path className="bs-spark bs-spark-3" d={SPARKLE} transform="translate(170 36) scale(0.6)" fill="#fff" />
      <g transform="translate(0 4) scale(0.9) translate(18 8)">
        <Person x={108} {...a} side="a" />
        <Person x={232} {...b} side="b" />
      </g>
      {/* little hearts when the photo is ready */}
      <g className="bs-hearts">
        <path d="M150 90 c-4 -9 -16 -3 -9 6 l9 8 l9 -8 c7 -9 -5 -15 -9 -6z" fill="#ff6b9a" transform="translate(-8 0) scale(.9)" />
        <path d="M250 70 c-3 -7 -12 -2 -7 5 l7 6 l7 -6 c5 -7 -4 -12 -7 -5z" fill="#ff6b9a" transform="scale(.9)" />
      </g>
    </svg>
  );
}

/** A tiny "previous photo" for the strip next to the camera view: soft backdrop and two heads. */
export function MiniShot({ i }: { i: number }) {
  const s = SHIRT[(i * 2) % 6];
  const t = SHIRT[(i * 2 + 3) % 6];
  const bg = [["#ffe3b8", "#ffc8de"], ["#b8f0e6", "#bfd8ff"], ["#d5ccff", "#bfc6ff"]][i % 3];
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 70" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs><linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={bg[0]} /><stop offset="1" stopColor={bg[1]} /></linearGradient></defs>
      <rect width="100" height="70" fill={`url(#${uid}-g)`} />
      <path d="M12 70 v-14 q0 -12 15 -12 q15 0 15 12 v14z" fill={s} />
      <circle cx="27" cy="34" r="10" fill={SKIN[(i + 1) % 4]} />
      <path d="M17 33 q0 -13 10 -13 q10 0 10 13 q-4 -7 -10 -7 q-6 0 -10 7z" fill={HAIR[i % 4]} />
      <path d="M52 70 v-14 q0 -12 15 -12 q15 0 15 12 v14z" fill={t} />
      <circle cx="67" cy="34" r="10" fill={SKIN[(i + 3) % 4]} />
      <path d="M57 33 q0 -13 10 -13 q10 0 10 13 q-4 -7 -10 -7 q-6 0 -10 7z" fill={HAIR[(i + 2) % 4]} />
    </svg>
  );
}
