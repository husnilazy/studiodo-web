import { useId } from "react";
import { BoothScene } from "./BoothScene";
import { Defs, Head, RIM, SPARKLE } from "./Mascot";

// The robot as the photobooth itself: its screen face turns into the camera view when a session starts (idle: happy eyes), its flash lamp
// fires on every shot and a polaroid is printed out of its belly when the photo is ready. Driven by the hero's session loop.
// phase: 0 idle · 1 payment · 2/3/4 countdown · 5 flash · 6 photo ready (see HeroVisual).

export function RobotBooth({ phase, shot, flashKey }: { phase: number; shot: number; flashKey: number }) {
  const id = useId().replace(/:/g, "");
  const sceneOn = phase >= 1 && phase <= 6;
  const printed = phase === 6;
  return (
    <svg viewBox="0 0 300 360" preserveAspectRatio="xMidYMid meet" className="mascot h-full w-full" aria-hidden="true">
      <Defs id={id} />
      <ellipse cx="150" cy="346" rx="86" ry="9" fill="#000" opacity="0.12" />
      {/* legs and chunky shoes */}
      <rect x="124" y="284" width="14" height="40" rx="6" fill="#2b2744" />
      <rect x="162" y="284" width="14" height="40" rx="6" fill="#2b2744" />
      <ellipse cx="124" cy="334" rx="28" ry="13" fill="#fff" stroke={RIM} strokeWidth="2" />
      <ellipse cx="176" cy="334" rx="28" ry="13" fill="#fff" stroke={RIM} strokeWidth="2" />
      {/* torso with the print slot; the polaroid is printed behind it, so it slides out of the slot */}
      <g style={{ transform: printed ? "translateY(0)" : "translateY(-52px)", opacity: printed ? 1 : 0, transition: "transform 0.9s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.4s" }}>
        <g transform="translate(150 318) rotate(-4)">
          <rect x="-33" y="-8" width="66" height="76" rx="6" fill="#fff" stroke={RIM} strokeWidth="2" />
          <rect x="-27" y="-2" width="54" height="52" rx="3.5" fill="#0a0a14" />
          <path d={SPARKLE} transform="translate(0 24) scale(1.2)" fill="#fff" />
          <rect x="-15" y="56" width="30" height="5" rx="2.5" fill="#d9d4fb" />
        </g>
      </g>
      <rect x="92" y="226" width="116" height="84" rx="32" fill={`url(#${id}-body)`} stroke={RIM} strokeWidth="2.5" />
      <rect x="122" y="270" width="56" height="9" rx="4.5" fill="#2b2744" />
      <rect x="127" y="273" width="46" height="3" rx="1.5" fill="#ffd37a" style={{ opacity: printed ? 1 : 0.25, transition: "opacity 0.3s" }} />
      {/* arms */}
      <path d="M96 250 q-26 4 -34 24" fill="none" stroke="#fff" strokeWidth="17" strokeLinecap="round" />
      <path d="M204 250 q26 4 34 24" fill="none" stroke="#fff" strokeWidth="17" strokeLinecap="round" />
      <circle cx="60" cy="278" r="14" fill="#fff" stroke={RIM} strokeWidth="2" />
      <circle cx="240" cy="278" r="14" fill="#fff" stroke={RIM} strokeWidth="2" />
      {/* the big head: its screen shows the camera view during a session */}
      <g transform="translate(14 -2) scale(1.12)">
        <Head
          id={id}
          flashKey={flashKey}
          sceneOn={sceneOn}
          screen={<BoothScene phase={phase} shot={shot} nested={{ x: 60, y: 78, w: 120, h: 108 }} />}
        />
      </g>
    </svg>
  );
}
