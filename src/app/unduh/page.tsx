import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { fetchLatestRelease } from "@/lib/site";

export const metadata: Metadata = {
  title: "Unduh Aplikasi",
  description: "Unduh aplikasi kiosk STUDIODO untuk Windows 10/11 dan lihat spesifikasi perangkat yang dibutuhkan.",
};

const requirements = [
  ["Sistem operasi", "Windows 10 atau 11 (64-bit)"],
  ["Prosesor", "[Spesifikasi minimum — perlu dikonfirmasi]"],
  ["RAM", "[Spesifikasi minimum — perlu dikonfirmasi]"],
  ["Penyimpanan", "[Spesifikasi minimum — perlu dikonfirmasi]"],
  ["Kamera", "Webcam atau kamera DSLR/mirrorless via digiCamControl"],
  ["Printer", "Printer dengan driver Windows"],
];

export default async function UnduhPage() {
  const release = await fetchLatestRelease();
  return (
    <PageShell eyebrow="Unduh" title="Aplikasi kiosk untuk Windows." intro="Install di PC booth Anda, lalu pasangkan dengan kunci kiosk dari dashboard admin.">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="glass-dark flex flex-col gap-5 p-10">
          <h2 className="font-display text-2xl tracking-tight text-white">STUDIODO untuk Windows</h2>
          {release ? (
            <>
              <p className="text-[15px] text-[#c6cce0]">Versi terbaru: {release.version}</p>
              <a href={release.installerUrl ?? release.releasesUrl} className="btn bg-white py-4 text-center text-foreground">
                Unduh Installer
              </a>
              <a href={release.releasesUrl} className="text-center text-sm text-[#c6cce0] underline underline-offset-4">
                Lihat semua rilis
              </a>
            </>
          ) : (
            <>
              <p className="text-[15px] leading-relaxed text-[#c6cce0]">
                Tautan unduhan belum tersedia. Daftar dulu dan tim kami akan mengirimkan installer.
              </p>
              <Link href="/daftar" className="btn bg-white py-4 text-center text-foreground">
                Daftar untuk Mendapat Installer
              </Link>
            </>
          )}
        </div>
        <div className="glass p-10">
          <h2 className="mb-5 font-display text-2xl tracking-tight">Kebutuhan perangkat</h2>
          <dl className="divide-y divide-foreground/[0.08]">
            {requirements.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-3.5 sm:grid-cols-[160px_1fr]">
                <dt className="text-sm font-semibold">{k}</dt>
                <dd className="text-[15px] text-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </PageShell>
  );
}
