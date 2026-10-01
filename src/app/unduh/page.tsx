import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Icon, IconTile } from "@/components/Icon";
import { Orb } from "@/components/Decor";
import { fetchLatestRelease, type ReleaseInfo } from "@/lib/site";

export const metadata: Metadata = {
  title: "Unduh Aplikasi",
  description: "Unduh aplikasi kiosk STUDIODO untuk Windows 10/11, lihat spesifikasi perangkat yang dibutuhkan, dan ikuti langkah pemasangannya.",
};

// "Minimum" is what the app is built for (Electron app, 64-bit Windows). The "disarankan" column is a practical
// recommendation for a booth that runs all day with a DSLR, not a measured benchmark — adjust it once real kiosks are profiled.
const requirementGroups = [
  {
    icon: "monitor",
    tint: "from-[#c7ceff] to-[#edefff]",
    title: "Komputer",
    rows: [
      ["Sistem operasi", "Windows 10 (64-bit)", "Windows 11 (64-bit)"],
      ["Prosesor", "Dual-core", "Quad-core atau lebih"],
      ["Memori (RAM)", "4 GB", "8 GB atau lebih"],
      ["Penyimpanan", "2 GB ruang kosong", "SSD dengan 10 GB+ kosong"],
    ],
  },
  {
    icon: "camera",
    tint: "from-[#ffd3e4] to-[#fff0f6]",
    title: "Kamera",
    rows: [
      ["Webcam", "Webcam USB apa pun", "Webcam 1080p"],
      ["DSLR / mirrorless", "Lewat digiCamControl (gratis)", "Canon EOS dengan kabel USB"],
    ],
  },
  {
    icon: "printer",
    tint: "from-[#b8f0e6] to-[#eafbf8]",
    title: "Printer & layar",
    rows: [
      ["Printer", "Printer apa pun dengan driver Windows", "Printer foto (dye-sub) untuk hasil terbaik"],
      ["Layar", "Monitor biasa", "Layar sentuh 1080p, posisi potret"],
    ],
  },
  {
    icon: "cloud",
    tint: "from-[#ffe3b8] to-[#fff6e6]",
    title: "Internet",
    rows: [
      ["Koneksi", "Dibutuhkan untuk QRIS dan galeri cloud", "Kabel LAN atau Wi-Fi stabil"],
      ["Koneksi putus", "Sesi tetap tersimpan, lalu dikirim saat online", "Cadangan hotspot untuk event"],
    ],
  },
];

const steps = [
  { icon: "download", tint: "from-[#c7ceff] to-[#edefff]", title: "Unduh & pasang", body: "Jalankan installer di PC booth, lalu buka aplikasi STUDIODO." },
  { icon: "lock", tint: "from-[#ffd3e4] to-[#fff0f6]", title: "Buat kunci kiosk", body: "Di dashboard Admin → Kiosk → API Key, buat kunci untuk satu PC booth." },
  { icon: "sliders", tint: "from-[#b8f0e6] to-[#eafbf8]", title: "Pasangkan", body: "Di layar Setup kiosk, isi URL server dan kunci tadi. Satu kunci terkunci ke satu komputer." },
  { icon: "rocket", tint: "from-[#ffe3b8] to-[#fff6e6]", title: "Hubungkan & mulai", body: "Pilih kamera dan printer, atur paket serta frame, lalu booth siap dipakai." },
];

const faqs = [
  ["Windows memperingatkan \"Windows protected your PC\". Aman?", "Aplikasi belum memiliki tanda tangan digital berbayar, jadi Windows SmartScreen menampilkan peringatan ini untuk setiap aplikasi baru. Klik “Informasi lebih lanjut”, lalu “Tetap jalankan”. Unduh hanya dari halaman ini atau dari rilis resmi kami di GitHub."],
  ["Apa bedanya Installer dan Portable?", "Installer memasang STUDIODO seperti aplikasi biasa lengkap dengan pintasan dan pembaruan otomatis. Portable adalah satu file yang bisa dijalankan langsung tanpa instalasi, cocok untuk mencoba atau PC yang tidak boleh dipasangi aplikasi."],
  ["Apakah aplikasi memperbarui dirinya sendiri?", "Ya. Setiap kiosk memeriksa versi baru secara berkala. Anda bisa mematikan pembaruan otomatis per kunci kiosk, misalnya untuk menahan satu booth di versi tertentu saat event besar."],
  ["Berapa komputer yang bisa saya pasang?", "Jumlah kunci kiosk aktif mengikuti paket langganan Anda. Satu kunci dipakai satu komputer; ganti komputer cukup dengan Reset device di dashboard."],
  ["Apakah perlu SDK Canon?", "Tidak. Kamera DSLR/mirrorless dikendalikan lewat digiCamControl, aplikasi gratis yang menjembatani kamera ke STUDIODO."],
  ["Apakah ada versi Mac atau tablet?", "Belum. Saat ini aplikasi kiosk hanya untuk Windows 10 dan 11 (64-bit)."],
];

function formatSize(bytes: number | null) {
  if (!bytes) return null;
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(iso));
}

/** Decorative, looping "installer window" — pure CSS, no real data. */
function InstallerMock() {
  return (
    <div aria-hidden="true" className="float-a relative mx-auto w-full max-w-[300px]">
      <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-accent/40 to-accent-soft/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-[#0b1020]/80 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffd166]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
          <span className="ml-3 text-[11px] font-medium tracking-wide text-white/50">STUDIODO Setup</span>
        </div>
        <div className="flex flex-col items-center gap-4 px-6 py-7">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <span className="ping-ring absolute inset-0 rounded-2xl bg-accent/50" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-soft text-white">
              <Icon name="camera" className="h-7 w-7" />
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="install-bar h-full rounded-full bg-gradient-to-r from-accent to-accent-soft" />
          </div>
          <div className="relative h-4 w-full text-center text-[11px] text-white/55">
            <span className="install-label-a absolute inset-x-0">Mengekstrak berkas…</span>
            <span className="install-label-b absolute inset-x-0">Siap dipakai ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadCard({ release }: { release: ReleaseInfo | null }) {
  const date = release ? formatDate(release.publishedAt) : null;
  return (
    <div data-reveal="scale" className="glass-dark relative overflow-hidden p-8 sm:p-10">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
      <div className="relative grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white">Windows 10 / 11 · 64-bit</span>
            {release && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#4ade80]/15 px-3 py-1 text-xs font-semibold text-[#86efac]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" /> Versi terbaru
              </span>
            )}
          </div>
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">STUDIODO untuk Windows</h2>
          {release ? (
            <>
              <p className="text-[15px] text-[#c6cce0]">
                Versi <span className="shimmer-text-light font-semibold">{release.version}</span>
                {date ? ` · dirilis ${date}` : ""}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href={release.installerUrl ? "/unduh/windows" : release.releasesUrl} className="btn flex-1 bg-white px-6 py-4 text-center text-[#0b1020] shadow-[0_12px_30px_rgba(79,79,232,0.35)]">
                  <span className="inline-flex items-center justify-center gap-2">
                    <Icon name="download" className="h-5 w-5" /> Unduh Installer{formatSize(release.installerSize) ? ` (${formatSize(release.installerSize)})` : ""}
                  </span>
                </a>
                {release.portableUrl && (
                  <a href="/unduh/windows?tipe=portable" className="btn flex-1 border border-white/25 px-6 py-4 text-center text-white hover:bg-white/10">
                    Versi Portable{formatSize(release.portableSize) ? ` (${formatSize(release.portableSize)})` : ""}
                  </a>
                )}
              </div>
              <a href={release.releasesUrl} className="self-start text-sm text-[#c6cce0] underline underline-offset-4 hover:text-white">
                Catatan rilis & semua versi
              </a>
            </>
          ) : (
            <>
              <p className="text-[15px] leading-relaxed text-[#c6cce0]">Tautan unduhan belum tersedia. Daftar dulu dan tim kami akan mengirimkan installer.</p>
              <Link href="/daftar" className="btn self-start bg-white px-7 py-4 text-center text-[#0b1020]">
                Daftar untuk Mendapat Installer
              </Link>
            </>
          )}
        </div>
        <InstallerMock />
      </div>
      {release?.notes && (
        <div className="relative mt-8 border-t border-white/10 pt-5">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#c6cce0]">Yang baru di versi ini</p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">{release.notes}</p>
        </div>
      )}
    </div>
  );
}

export default async function UnduhPage() {
  const release = await fetchLatestRelease(60);
  return (
    <PageShell eyebrow="Unduh" title="Aplikasi kiosk untuk Windows." intro="Install di PC booth Anda, lalu pasangkan dengan kunci kiosk dari dashboard admin. Pembaruan berikutnya berjalan otomatis.">
      <Orb className="right-0 top-[-80px] h-44 w-44" speed={0.14} />
      <div className="flex flex-col gap-20">
        <DownloadCard release={release} />

        <section aria-labelledby="syarat" className="flex flex-col gap-8">
          <div data-reveal="up" className="flex max-w-[640px] flex-col gap-3">
            <div className="eyebrow">Persyaratan sistem</div>
            <h2 id="syarat" className="font-display text-3xl tracking-[-0.03em] md:text-4xl">Pastikan PC booth Anda siap.</h2>
            <p className="text-[16px] leading-relaxed text-muted">Kolom “disarankan” adalah panduan untuk booth yang menyala seharian dan melayani banyak pelanggan.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {requirementGroups.map((g, i) => (
              <div key={g.title} data-reveal="up" data-delay={String(i * 100)} className="glass lift p-7 sm:p-8">
                <div className="mb-5 flex items-center gap-4">
                  <IconTile name={g.icon} tint={g.tint} size="md" />
                  <h3 className="font-display text-xl tracking-tight">{g.title}</h3>
                </div>
                <div className="hidden grid-cols-[130px_1fr_1fr] gap-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted sm:grid">
                  <span />
                  <span>Minimum</span>
                  <span className="text-accent">Disarankan</span>
                </div>
                <dl className="divide-y divide-foreground/[0.08]">
                  {g.rows.map(([label, min, rec]) => (
                    <div key={label} className="grid gap-1 py-3.5 sm:grid-cols-[130px_1fr_1fr] sm:gap-4">
                      <dt className="text-sm font-semibold">{label}</dt>
                      <dd className="text-[14px] text-muted"><span className="mr-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted/70 sm:hidden">Min:</span>{min}</dd>
                      <dd className="text-[14px] text-foreground/85"><span className="mr-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent sm:hidden">Disarankan:</span>{rec}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="pasang" className="relative flex flex-col gap-8">
          <div data-reveal="up" className="flex max-w-[640px] flex-col gap-3">
            <div className="eyebrow">Cara memasang</div>
            <h2 id="pasang" className="font-display text-3xl tracking-[-0.03em] md:text-4xl">Dari unduh sampai booth siap, empat langkah.</h2>
          </div>
          <div className="relative">
            <svg aria-hidden="true" className="pointer-events-none absolute left-[8%] right-[8%] top-[58px] hidden h-3 w-[84%] lg:block" viewBox="0 0 100 2" preserveAspectRatio="none">
              <line className="step-line text-accent" x1="0" y1="1" x2="100" y2="1" pathLength="100" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="100" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} data-reveal="up" data-delay={String(i * 120)} className="glass lift flex min-h-[220px] flex-col gap-4 p-7">
                  <div className="flex items-center justify-between">
                    <IconTile name={s.icon} tint={s.tint} />
                    <span className="font-display text-[44px] font-light leading-none text-accent/70">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="font-display text-[21px] tracking-tight">{s.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <p data-reveal="up" className="text-[15px] text-muted">
            Panduan lengkap: <Link href="/blog/memasang-aplikasi-dan-menghubungkan-kiosk" className="font-semibold text-accent underline underline-offset-4">memasang aplikasi & menghubungkan kiosk</Link>.
          </p>
        </section>

        <section aria-labelledby="dslr" data-reveal="up" className="glass relative overflow-hidden p-8 sm:p-10">
          <div className="grid items-start gap-8 md:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col gap-4">
              <IconTile name="camera" tint="from-[#ffd3e4] to-[#fff0f6]" />
              <h2 id="dslr" className="font-display text-2xl tracking-tight md:text-3xl">Memakai kamera DSLR atau mirrorless?</h2>
              <p className="text-[15px] leading-relaxed text-muted">
                STUDIODO berbicara dengan <strong className="font-semibold text-foreground">digiCamControl</strong>, aplikasi gratis yang mengendalikan kamera dari komputer. Tidak perlu SDK Canon. Live view menyala otomatis saat sesi foto dimulai dan mati setelahnya, jadi kamera tidak cepat panas.
              </p>
              <Link href="/blog/menghubungkan-kamera-webcam-dan-dslr" className="self-start text-[15px] font-semibold text-accent underline underline-offset-4">Panduan menghubungkan kamera</Link>
            </div>
            <ol className="flex flex-col gap-3">
              {[
                "Pasang digiCamControl di PC booth dan pastikan kamera terdeteksi.",
                "Di digiCamControl, aktifkan webserver (port bawaan 5513).",
                "Jalankan digiCamControl sebelum membuka sesi kiosk.",
                "Di STUDIODO, buka Admin → Kiosk → Kamera dan pilih mode tether.",
              ].map((t, i) => (
                <li key={t} className="flex gap-4 rounded-2xl bg-foreground/[0.04] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">{i + 1}</span>
                  <span className="text-[15px] leading-relaxed">{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="faq" className="flex flex-col gap-8">
          <div data-reveal="up" className="flex max-w-[640px] flex-col gap-3">
            <div className="eyebrow">Pertanyaan umum</div>
            <h2 id="faq" className="font-display text-3xl tracking-[-0.03em] md:text-4xl">Sebelum Anda mengunduh.</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map(([q, a], i) => (
              <details key={q} data-reveal="up" data-delay={String((i % 2) * 100)} className="glass faq-item group h-fit p-6">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[16px] font-semibold">
                  {q}
                  <span aria-hidden="true" className="faq-plus mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">+</span>
                </summary>
                <p className="pt-3 text-[15px] leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section data-reveal="scale" className="glass-dark relative overflow-hidden p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative flex flex-col items-center gap-5">
            <h2 className="font-display text-3xl tracking-tight text-white md:text-4xl">Belum punya akun STUDIODO?</h2>
            <p className="max-w-[520px] text-[16px] leading-relaxed text-[#c6cce0]">Aplikasi butuh kunci kiosk dari dashboard admin. Daftar gratis dulu, lalu pasangkan PC booth Anda.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/daftar" className="btn bg-white px-8 py-4 text-[#0b1020]">Coba Gratis</Link>
              <Link href="/bantuan" className="btn border border-white/25 px-8 py-4 text-white hover:bg-white/10">Butuh bantuan?</Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
