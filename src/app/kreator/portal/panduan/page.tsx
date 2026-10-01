const rules = [
  { t: "Format file", b: "PNG dengan latar transparan di area foto. Maksimal 2 MB, sisi terpendek minimal 600 px dan terpanjang maksimal 6000 px." },
  { t: "Ukuran kanvas", b: "Ukuran kanvas mengikuti ukuran gambar frame Anda. Untuk cetak 4R gunakan 1200 × 1800 px (portrait) atau 1800 × 1200 px (landscape); 2R: 900 × 1350 px." },
  { t: "Slot foto", b: "Tarik pada kanvas untuk membuat slot, geser untuk memindah, tarik sudut kanan-bawah untuk mengubah ukuran. Minimal 40 px, maksimal 12 slot per template, dan harus berada di dalam kanvas." },
  { t: "Area aman", b: "Beri jarak minimal sekitar 3% dari tepi frame untuk slot dan teks penting agar tidak terpotong saat dicetak." },
  { t: "Konten", b: "Hanya karya milik Anda atau yang Anda berhak distribusikan. Hindari logo/merek pihak lain, konten dewasa, dan SARA." },
  { t: "Tinjauan", b: "Tim STUDIODO meninjau setiap template. Jika perlu perbaikan, alasannya muncul di kartu template; edit lalu kirim ulang." },
];

export default function GuidePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Panduan</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Panduan membuat template</h1>
        <p className="mt-2 max-w-[560px] text-[15px] text-muted">Ikuti ketentuan ini agar template Anda cepat lolos tinjauan.</p>
      </div>
      <ul className="grid gap-6 md:grid-cols-2">
        {rules.map((r) => (
          <li key={r.t} className="glass p-7">
            <h2 className="font-display text-xl tracking-tight">{r.t}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{r.b}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
