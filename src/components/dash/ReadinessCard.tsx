import Link from "next/link";
import type { ReadinessCheck, ReadinessReport } from "@/lib/portalTypes";

// "Kesiapan booth": plain-language checklist at the top of the dashboard — what is still missing (storage, payment, packages,
// frames, booths, subscription) and a button to the screen that fixes it. Server-rendered; hidden when everything is fine and
// when the API is too old to answer (a missing checklist must never break the dashboard).

const TONE: Record<ReadinessCheck["status"], { symbol: string; cls: string; label: string }> = {
  ok: { symbol: "✓", cls: "bg-[#dff7ec] text-[#0f6b45]", label: "Siap" },
  warn: { symbol: "!", cls: "bg-[#fff3d6] text-[#7a5a00]", label: "Perlu dicek" },
  error: { symbol: "✕", cls: "bg-[#ffe3e3] text-[#a12626]", label: "Belum siap" },
};

/** Where each step sends the tenant in the web dashboard. */
const TARGETS: Record<string, string> = {
  "kiosk:keys": "/portal/booth",
  "kiosk:storage": "/portal/pengaturan",
  "finance:gateway": "/portal/pembayaran",
  "finance:packages": "/portal/paket",
  "section:control": "/portal/pengaturan",
  "href:/admin/frames": "/portal/frame",
};

export function ReadinessCard({ report }: { report: ReadinessReport }) {
  const needs = report.checks.filter((c) => c.status !== "ok");
  if (needs.length === 0) return null;
  const heading = report.ready ? "Hampir siap. Ada yang perlu dicek." : "Booth belum siap dipakai. Selesaikan langkah di bawah.";
  return (
    <section className={`glass p-5 md:p-6 ${report.ready ? "" : "ring-2 ring-[#ffb4b4]"}`} aria-label="Kesiapan booth">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg tracking-tight">{heading}</h2>
          <p className="text-[13px] text-muted">{report.done} dari {report.total} langkah sudah siap · {needs.length} perlu perhatian</p>
        </div>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-[var(--soft)]" aria-hidden="true"><div className="h-full rounded-full bg-[#2ec27e]" style={{ width: `${Math.round((report.done / Math.max(1, report.total)) * 100)}%` }} /></div>
      </div>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {needs.map((c) => {
          const href = c.action ? TARGETS[c.action.target] : undefined;
          return (
            <li key={c.id} className="flex items-start gap-3 rounded-2xl bg-[var(--soft)] p-3.5">
              <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${TONE[c.status].cls}`} aria-label={TONE[c.status].label}>{TONE[c.status].symbol}</span>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold">{c.title}</div>
                <p className="text-[13px] leading-relaxed text-muted">{c.message}</p>
                {c.action && href && <Link href={href} className="btn btn-primary mt-2 inline-block px-4 py-1.5 text-[12.5px]">{c.action.label}</Link>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
