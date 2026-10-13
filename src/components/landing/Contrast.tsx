import { SectionHeading } from "../SectionHeading";
import { Icon } from "../Icon";

const ROWS: { before: string; after: string }[] = [
  { before: "Nunggu transfer, cek mutasi satu per satu", after: "QRIS otomatis — kiosk lanjut sendiri begitu lunas" },
  { before: "Kirim foto ke WhatsApp pelanggan satu-satu", after: "QR di layar, galeri cloud langsung terbuka di HP mereka" },
  { before: "Ganti frame berarti panggil desainer dan install ulang", after: "Pilih dari marketplace, pasang satu klik" },
  { before: "Keliling cek booth, baru tahu rusak setelah ada komplain", after: "Status semua booth terlihat real-time dari HP" },
  { before: "Catat omzet manual, ujungnya selisih kas", after: "Riwayat dan grafik omzet otomatis, ekspor ke CSV" },
  { before: "Internet putus, sesi pelanggan hilang", after: "Sesi tersimpan di kiosk dan terkirim sendiri saat online" },
  { before: "Update aplikasi harus datangi tiap lokasi", after: "Update otomatis, tinggal atur per kiosk" },
];

export function Contrast() {
  return (
    <section id="bedanya" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-12 px-4 py-20 md:px-16">
      <SectionHeading eyebrow="Kenapa STUDIODO" title="Semua yang dulu ribet, sekarang jalan sendiri." />
      <div className="mx-auto grid w-full max-w-[980px] gap-3">
        <div className="hidden grid-cols-2 gap-6 px-6 text-[13px] font-semibold uppercase tracking-widest text-muted md:grid">
          <span>Biasanya</span>
          <span className="text-accent">Di STUDIODO</span>
        </div>
        {ROWS.map((r, i) => (
          <div key={r.before} data-reveal="up" data-delay={String(i * 70)} className="glass lift grid gap-3 p-5 md:grid-cols-2 md:gap-6 md:px-6 md:py-5">
            <p className="flex items-start gap-3 text-[15px] leading-relaxed text-muted">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff5a6e]/15 text-[#ff5a6e]"><Icon name="x" className="h-3 w-3" /></span>
              <span className="line-through decoration-[#ff5a6e]/40">{r.before}</span>
            </p>
            <p className="flex items-start gap-3 text-[15px] font-medium leading-relaxed">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22c58b]/20 text-[#22c58b]"><Icon name="check" className="h-3 w-3" /></span>
              {r.after}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
