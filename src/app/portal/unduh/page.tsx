import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/dash/PageHeader";
import { getSummary } from "@/lib/portal";
import { fetchLatestRelease } from "@/lib/site";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const size = (bytes: number | null) => (bytes ? `${Math.round(bytes / (1024 * 1024))} MB` : null);
/** "0.1.17" → [0,1,17]; unknown/garbage compares as oldest. */
const parts = (v: string | null) => (v ?? "").replace(/^v/, "").split(".").map((n) => Number.parseInt(n, 10) || 0);
const isOlder = (v: string | null, latest: string) => {
  const a = parts(v), b = parts(latest);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) { if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) < (b[i] ?? 0); }
  return false;
};

const REQ = [
  ["Sistem operasi", "Windows 10 / 11 (64-bit)"],
  ["Memori & prosesor", "4 GB RAM · dual-core (disarankan 8 GB · quad-core)"],
  ["Penyimpanan", "2 GB kosong (disarankan SSD)"],
  ["Kamera", "Webcam USB, atau DSLR lewat digiCamControl"],
  ["Internet", "Dibutuhkan untuk QRIS & galeri cloud"],
];

export default async function PortalUnduhPage() {
  // The release lookup is cached by Next for 10 minutes, so this page doesn't hit GitHub on every visit.
  const [release, summary] = await Promise.all([fetchLatestRelease(600), getSummary()]);
  const latest = release?.version ?? null;
  const booths = summary.kiosks.filter((k) => k.paired);
  const outdated = latest ? booths.filter((k) => isOlder(k.appVersion, latest)) : [];
  const installerHref = release?.installerUrl ? "/unduh/windows" : (release?.releasesUrl ?? "https://github.com");

  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader eyebrow="Akun" title="Unduh aplikasi kiosk" intro="Selalu versi terbaru, langsung dari dashboard — tanpa keluar dan masuk lagi. Pasang di PC booth, lalu pasangkan dengan key booth Anda." />

      <section className="glass-dark relative overflow-hidden rounded-[28px] p-7 md:p-9">
        <span className="dash-orb" style={{ right: -60, top: -70, width: 300, height: 300, background: "radial-gradient(circle, rgba(154,166,255,.5), transparent 68%)" }} aria-hidden="true" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/12 px-3 py-1 text-[12px] font-semibold">Windows 10 / 11 · 64-bit</span>
              {release && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4ade80]/15 px-3 py-1 text-[12px] font-semibold text-[#86efac]"><span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />Versi terbaru</span>}
            </div>
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">STUDIODO untuk Windows</h2>
            {release ? (
              <p className="text-[15px] text-white/70">Versi <span className="font-semibold text-white">{release.version}</span>{release.publishedAt ? ` · dirilis ${formatDate(release.publishedAt)}` : ""}</p>
            ) : (
              <p className="text-[15px] text-white/70">Info versi terbaru belum bisa dimuat. Anda tetap bisa membuka halaman rilis resmi.</p>
            )}
            <div className="mt-1 flex flex-col gap-3 sm:flex-row">
              <a href={installerHref} className="btn inline-flex flex-1 items-center justify-center gap-2 bg-white px-6 py-4 text-center text-[15px] !text-[#0b1020] shadow-[0_12px_30px_rgba(79,79,232,0.4)]">
                <Icon name="download" className="h-5 w-5" />Unduh Installer{size(release?.installerSize ?? null) ? ` (${size(release?.installerSize ?? null)})` : ""}
              </a>
              {release?.portableUrl && (
                <a href="/unduh/windows?tipe=portable" className="btn flex-1 border border-white/25 !bg-white/10 px-6 py-4 text-center text-[15px] !text-white">Versi Portable{size(release.portableSize) ? ` (${size(release.portableSize)})` : ""}</a>
              )}
            </div>
            <a href={release?.releasesUrl ?? "https://github.com"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] text-white/65 underline-offset-4 hover:text-white hover:underline">Catatan rilis &amp; semua versi <Icon name="external" className="h-3.5 w-3.5" /></a>
          </div>
          <div className="hidden justify-center lg:flex" aria-hidden="true">
            <div className="float-a relative w-full max-w-[250px] overflow-hidden rounded-2xl border border-white/15 bg-black/25">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-3.5 py-2.5"><span className="h-2 w-2 rounded-full bg-[#ff6b6b]" /><span className="h-2 w-2 rounded-full bg-[#ffd166]" /><span className="h-2 w-2 rounded-full bg-[#4ade80]" /><span className="ml-2 text-[10.5px] text-white/50">STUDIODO Setup</span></div>
              <div className="flex flex-col items-center gap-3.5 px-5 py-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-soft"><Icon name="camera" className="h-6 w-6" /></span>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"><div className="install-bar h-full rounded-full bg-gradient-to-r from-accent to-accent-soft" /></div>
                <div className="relative h-3.5 w-full text-center text-[10.5px] text-white/55"><span className="install-label-a absolute inset-x-0">Mengekstrak berkas…</span><span className="install-label-b absolute inset-x-0">Siap dipakai ✓</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5">
        <section className="glass p-6 md:p-7">
          <h2 className="font-display text-lg tracking-tight">Langkah pemasangan</h2>
          <ol className="mt-4 space-y-4">
            {[
              ["Unduh & pasang", "Jalankan installer di PC booth, lalu buka aplikasi STUDIODO. Jika Windows SmartScreen muncul, pilih “Informasi lebih lanjut” → “Tetap jalankan”."],
              ["Siapkan key booth", <>Buat atau salin key di <Link href="/portal/booth" className="font-semibold text-accent hover:underline">Booth &amp; langganan</Link>. Satu key = satu booth = satu komputer.</>],
              ["Pasangkan", "Di layar Setup, isi URL server dan key tadi. Aplikasi memperbarui dirinya sendiri setelah ini."],
              ["Pilih kamera & printer", "Atur paket, frame, dan pembayaran — booth siap dipakai."],
            ].map(([t, b], i) => (
              <li key={i} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--ink)] font-display text-[13px] text-white">{i + 1}</span>
                <div><div className="text-[14.5px] font-semibold">{t}</div><p className="mt-0.5 text-[13.5px] leading-relaxed text-muted">{b}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-4 lg:gap-5">
          <section className="glass p-6 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg tracking-tight">Versi di booth Anda</h2>
              {latest && booths.length > 0 && <span className={`rounded-full px-3 py-1 text-[11.5px] font-semibold ${outdated.length === 0 ? "bg-[#dff7ec] text-[#0f6b45]" : "bg-[#fff3d6] text-[#7a5a00]"}`}>{outdated.length === 0 ? "Semua terbaru" : `${outdated.length} perlu pembaruan`}</span>}
            </div>
            {booths.length === 0 ? (
              <p className="mt-3 text-[14px] text-muted">Belum ada booth yang terpasang. Setelah dipasangkan, versi aplikasinya tampil di sini.</p>
            ) : (
              <ul className="dash-scroll mt-3 max-h-[240px] divide-y divide-[var(--card-edge)] overflow-y-auto">
                {booths.map((k) => {
                  const old = latest ? isOlder(k.appVersion, latest) : false;
                  return (
                    <li key={k.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                      <span className="min-w-0 truncate font-medium">{k.label ?? "Booth tanpa nama"}</span>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${old ? "bg-[#fff3d6] text-[#7a5a00]" : "bg-[#dff7ec] text-[#0f6b45]"}`}>v{k.appVersion ?? "—"}{old ? " · lama" : ""}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            {outdated.length > 0 && <p className="mt-3 text-[12.5px] leading-snug text-muted">Booth yang online memperbarui diri otomatis (kecuali auto-update dimatikan di Booth &amp; langganan). Booth lama yang offline akan menyusul saat menyala.</p>}
          </section>

          <section className="glass p-6 md:p-7">
            <h2 className="font-display text-lg tracking-tight">Kebutuhan perangkat</h2>
            <dl className="mt-3 divide-y divide-[var(--card-edge)] text-[13.5px]">
              {REQ.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2"><dt className="shrink-0 text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
            </dl>
          </section>
        </div>
      </div>

      {release?.notes && (
        <section className="glass p-6 md:p-7">
          <h2 className="font-display text-lg tracking-tight">Yang baru di versi {release.version}</h2>
          <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-muted">{release.notes}</p>
        </section>
      )}
    </div>
  );
}
