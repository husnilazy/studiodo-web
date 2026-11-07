import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/dash/PageHeader";

export const metadata: Metadata = { title: "Kamera yang didukung" };

type Status = "ready" | "beta" | "soon";
const STATUS: Record<Status, { label: string; cls: string }> = {
  ready: { label: "Tersedia", cls: "bg-[#dff7ec] text-[#0f6b45]" },
  beta: { label: "Beta · dalam pengujian", cls: "bg-[#fff3d6] text-[#7a5a00]" },
  soon: { label: "Belum tersedia", cls: "bg-[var(--card-edge)] text-muted" },
};

/** Satu jalur sambungan kamera ke kiosk. */
const ROUTES: { name: string; status: Status; tagline: string; points: string[] }[] = [
  {
    name: "Webcam USB",
    status: "ready",
    tagline: "Paling mudah — colok dan pakai.",
    points: [
      "Semua webcam USB yang dikenali Windows, tanpa instalasi tambahan.",
      "Resolusi foto mengikuti kemampuan webcam — cocok untuk booth ringan.",
      "Kamera mirrorless/DSLR yang punya mode webcam (mis. Sony lewat Imaging Edge Webcam, Canon lewat EOS Webcam Utility) juga muncul sebagai webcam, tapi kualitasnya setara video, bukan foto resolusi penuh.",
    ],
  },
  {
    name: "Canon EOS lewat digiCamControl",
    status: "ready",
    tagline: "Foto resolusi penuh dari DSLR/mirrorless Canon.",
    points: [
      "Foto penuh langsung ke kiosk, live view di layar, autofocus dari kiosk.",
      "ISO, shutter speed, aperture, dan white balance bisa diatur dari Admin kiosk → Kamera.",
      "Sudah diuji pada Canon EOS 1300D. Model EOS lain yang didukung digiCamControl umumnya bisa dipakai.",
      "Butuh aplikasi digiCamControl (gratis) terpasang dan webserver-nya aktif.",
    ],
  },
  {
    name: "Canon EOS — SDK langsung (EDSDK)",
    status: "ready",
    tagline: "Tanpa digiCamControl: kiosk bicara langsung ke kamera lewat Canon EDSDK.",
    points: [
      "Fungsinya sama dengan jalur digiCamControl, tapi satu aplikasi lebih sedikit di PC booth.",
      "Sudah teruji di kamera Canon asli.",
      "Diaktifkan bila diminta tim STUDIODO; tidak bisa jalan bersamaan dengan digiCamControl atau EOS Utility.",
    ],
  },
  {
    name: "Sony Alpha — bridge native",
    status: "beta",
    tagline: "Untuk model Sony terbaru yang didukung SDK resmi Sony.",
    points: [
      "Didukung SDK (daftar resmi Sony): A1, A9 II/III, A7 IV/V, A7R IV/V/VI, A7S III, A7C/C II/C R, A6700, FX3, FX30, ZV-E1, dan seri sejenis.",
      "Model lama seperti A6000, A6400, dan A6600 tidak termasuk — pakai mode webcam di atas.",
      "Belum diuji di kamera asli oleh tim STUDIODO. Menu kamera harus: USB Connection = PC Remote, kualitas gambar JPEG.",
    ],
  },
  {
    name: "Nikon",
    status: "soon",
    tagline: "Belum ada jalur sambungan foto penuh.",
    points: [
      "Kamera Nikon yang punya mode webcam bisa dipakai lewat jalur Webcam USB.",
      "Dukungan foto resolusi penuh (seri Z dan DSLR) menyusul bila ada permintaan tenant.",
    ],
  },
];

const BRANDS: [string, string, string, Status][] = [
  ["Webcam USB / mode webcam", "Foto video (resolusi webcam)", "Otomatis (browser)", "ready"],
  ["Canon EOS", "Foto penuh · live view · atur ISO/shutter/aperture/WB", "digiCamControl", "ready"],
  ["Canon EOS", "Sama seperti di atas", "SDK langsung (EDSDK)", "ready"],
  ["Sony Alpha (model baru)", "Foto penuh · live view · atur eksposur", "Bridge native (Sony SDK)", "beta"],
  ["Sony Alpha (model lama, mis. A6600)", "Hanya lewat mode webcam", "Webcam USB", "ready"],
  ["Nikon", "Hanya lewat mode webcam", "Webcam USB", "soon"],
];

const CHECKLIST = [
  ["Kabel USB data", "Pakai kabel data asli atau yang berkualitas — kabel charger-only membuat kamera tidak terdeteksi. Hindari hub USB murah."],
  ["Daya terus-menerus", "Gunakan adaptor AC / baterai dummy. Baterai habis di tengah acara menghentikan sesi."],
  ["Matikan auto power off", "Di menu kamera, nonaktifkan Auto Power Off supaya kamera tidak tidur saat booth sepi."],
  ["Mode & fokus", "Mode M (manual) atau P/Av dengan ISO tetap. Lensa di AF bila ingin autofocus dari kiosk, MF bila ingin fokus tetap."],
  ["Kualitas gambar JPEG", "Setel ke JPEG (Large/Fine). Kamera yang hanya menyimpan RAW tidak bisa dipakai kiosk."],
  ["Tutup aplikasi lain", "EOS Utility, Imaging Edge, atau aplikasi kamera lain tidak boleh terbuka — hanya satu aplikasi yang bisa memegang kamera."],
  ["Satu kamera per PC", "Kiosk memakai satu kamera per booth. Colok satu saja saat pemasangan."],
];

const FAQ = [
  ["Kamera tidak terdeteksi di kiosk", "Cek kabel data dan port USB (coba port langsung di PC, bukan hub), pastikan kamera menyala dan tidak sedang tidur, lalu tutup EOS Utility / Imaging Edge. Untuk Sony: USB Connection harus PC Remote."],
  ["Live view hitam atau macet", "Biasanya kamera sedang dipakai aplikasi lain, atau masuk mode tidur. Tutup aplikasi lain, nyalakan ulang kamera, lalu buka lagi layar sesi."],
  ["Foto tidak masuk setelah shutter", "Pastikan kualitas gambar JPEG (bukan RAW saja) dan kartu memori tidak penuh. Pada Canon, kamera tidak boleh dalam mode video."],
  ["Autofocus gagal", "Pastikan lensa di posisi AF dan ada cukup cahaya di wajah. Bila AF gagal, kiosk tetap memotret tanpa AF agar sesi tidak batal."],
  ["Kamera panas saat acara panjang", "Live view hanya menyala selama sesi foto dan mati sendiri saat booth idle. Beri ventilasi dan gunakan adaptor AC, bukan baterai."],
  ["Kamera saya tidak ada di daftar", "Pakai jalur Webcam USB lebih dulu. Hubungi kami dengan merek dan model kamera Anda — permintaan tenant menentukan model mana yang kami tambahkan berikutnya."],
];

function Badge({ status }: { status: Status }) {
  const s = STATUS[status];
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${s.cls}`}>{s.label}</span>;
}

export default function PortalKameraPage() {
  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader
        eyebrow="Kelola kiosk"
        title="Kamera yang didukung"
        intro="Panduan memilih dan menyambungkan kamera ke booth Anda. Mulai dari webcam USB, atau naik ke kamera DSLR/mirrorless untuk foto resolusi penuh."
        actions={
          <Link href="/portal/unduh" className="btn inline-flex items-center gap-2 px-4 py-2.5 text-[13.5px]">
            <Icon name="download" className="h-4 w-4" />Unduh aplikasi kiosk
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 lg:gap-5">
        {ROUTES.map((r) => (
          <article key={r.name} className="glass flex flex-col gap-3 p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--card-edge)]"><Icon name="camera" className="h-5 w-5" /></span>
                <h2 className="font-display text-[17px] leading-tight tracking-tight">{r.name}</h2>
              </div>
              <Badge status={r.status} />
            </div>
            <p className="text-[14px] font-medium">{r.tagline}</p>
            <ul className="space-y-1.5 text-[13.5px] leading-relaxed text-muted">
              {r.points.map((p) => (
                <li key={p} className="flex gap-2"><Icon name="check" className="mt-[3px] h-3.5 w-3.5 shrink-0 text-accent" /><span>{p}</span></li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="glass p-6 md:p-7">
        <h2 className="font-display text-lg tracking-tight">Ringkasan per jenis kamera</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13.5px]">
            <thead className="text-[12px] uppercase tracking-wide text-muted">
              <tr><th className="py-2 pr-4 font-semibold">Kamera</th><th className="py-2 pr-4 font-semibold">Kemampuan</th><th className="py-2 pr-4 font-semibold">Jalur</th><th className="py-2 font-semibold">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-edge)]">
              {BRANDS.map(([cam, cap, via, st], i) => (
                <tr key={i}>
                  <td className="py-2.5 pr-4 font-medium">{cam}</td>
                  <td className="py-2.5 pr-4 text-muted">{cap}</td>
                  <td className="py-2.5 pr-4 text-muted">{via}</td>
                  <td className="py-2.5"><Badge status={st} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12.5px] leading-snug text-muted">Status “Beta” berarti fiturnya sudah dibuat tapi belum lulus uji di kamera asli — gunakan untuk percobaan, bukan booth yang sedang beroperasi.</p>
      </section>

      <div className="grid gap-4 xl:grid-cols-2 lg:gap-5">
        <section className="glass p-6 md:p-7">
          <h2 className="font-display text-lg tracking-tight">Sebelum menyambungkan kamera</h2>
          <ul className="mt-4 space-y-3.5">
            {CHECKLIST.map(([t, b]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-white"><Icon name="check" className="h-3.5 w-3.5" /></span>
                <div><div className="text-[14px] font-semibold">{t}</div><p className="mt-0.5 text-[13.5px] leading-relaxed text-muted">{b}</p></div>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass p-6 md:p-7">
          <h2 className="font-display text-lg tracking-tight">Langkah menyambungkan</h2>
          <ol className="mt-4 space-y-4">
            {[
              ["Pasang aplikasi kiosk", <>Unduh dan pasang dari <Link href="/portal/unduh" className="font-semibold text-accent hover:underline">Unduh aplikasi</Link>, lalu pasangkan dengan key booth.</>],
              ["Colok kamera", "Hubungkan lewat USB, nyalakan, dan atur menu kamera sesuai daftar di samping. Untuk DSLR Canon lewat digiCamControl, jalankan digiCamControl dan aktifkan webserver-nya."],
              ["Pilih kamera di kiosk", "Buka Admin kiosk → Kamera. Webcam dipilih dari daftar; untuk kamera DSLR/mirrorless, isi URL bridge kamera sesuai jalur yang dipakai."],
              ["Uji satu sesi", "Jalankan sesi percobaan: cek live view, autofocus, dan hasil foto sebelum booth dibuka untuk tamu."],
            ].map(([t, b], i) => (
              <li key={i} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--ink)] font-display text-[13px] text-white">{i + 1}</span>
                <div><div className="text-[14.5px] font-semibold">{t}</div><p className="mt-0.5 text-[13.5px] leading-relaxed text-muted">{b}</p></div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="glass p-6 md:p-7">
        <h2 className="font-display text-lg tracking-tight">Pertanyaan umum &amp; pemecahan masalah</h2>
        <div className="mt-3 divide-y divide-[var(--card-edge)]">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14.5px] font-semibold">
                {q}
                <Icon name="chevron-down" className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
