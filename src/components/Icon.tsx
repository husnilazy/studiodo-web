// Small stroke icon set for feature/benefit cards. The names are the CMS "Ikon" options defined on the
// server (ICON_OPTIONS in server/lib/siteContent.ts) — keep the two lists in sync. Paths are drawn on a
// 24×24 grid; an unknown name falls back to "sparkles" so a bad CMS value never leaves an empty box.
const PATHS: Record<string, string> = {
  qr: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h3v3h-3z M20 14v.01 M14 20h3 M20 17v4",
  ticket: "M3 8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a2 2 0 0 0 0 4v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a2 2 0 0 0 0-4z M14 7v10",
  layout: "M3 4h18v16H3z M3 9h18 M9 9v11",
  camera: "M4 8h3l2-3h6l2 3h3v11H4z M12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  image: "M4 5h16v14H4z M4 16l5-5 4 4 3-3 4 4 M9 9.5h.01",
  video: "M3 6h12v12H3z M15 10l6-3v10l-6-3",
  monitor: "M3 4h18v12H3z M8 20h8 M12 16v4",
  printer: "M7 9V3h10v6 M7 17H4v-6h16v6h-3 M7 14h10v7H7z",
  cloud: "M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5 4.25 4.25 0 0 1 17.5 18z",
  wallet: "M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M3 7l3-3h11 M16 14h2",
  sparkles: "M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z",
  chart: "M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-3",
  users: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20a6 6 0 0 1 12 0 M17 11a2.5 2.5 0 1 0 0-5 M21 19a5 5 0 0 0-4-4.9",
  "map-pin": "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4",
  palette: "M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2-.6-1.2.2-2.5 1.5-2.5H17a4 4 0 0 0 4-4c0-5-4-9.5-9-9.5z M7.5 11h.01 M10 7.5h.01 M14.5 7.5h.01",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
};

export function Icon({ name, className = "h-6 w-6" }: { name?: string; className?: string }) {
  const d = PATHS[name ?? ""] ?? PATHS.sparkles;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** Rounded gradient tile that frames an icon — the visual used on the feature and benefit cards. */
export function IconTile({ name, tint, dark = false, size = "lg" }: { name?: string; tint: string; dark?: boolean; size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-[52px] w-[52px] rounded-2xl" : "h-[42px] w-[42px] rounded-[13px]";
  return (
    <div className={`flex shrink-0 items-center justify-center bg-gradient-to-br ${box} ${tint} ${dark ? "text-white" : "text-accent"}`}>
      <Icon name={name} className={size === "lg" ? "h-6 w-6" : "h-5 w-5"} />
    </div>
  );
}
