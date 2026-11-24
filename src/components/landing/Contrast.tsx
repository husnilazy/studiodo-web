import { SectionHeading } from "../SectionHeading";
import { Icon } from "../Icon";
import { Figure } from "../brand/Figure";

const ROWS: { before: string; after: string }[] = [
  { before: "Nunggu transfer, cek mutasi satu per satu", after: "QRIS otomatis — kiosk lanjut sendiri begitu lunas" },
  { before: "Kirim foto ke WhatsApp pelanggan satu-satu", after: "QR di layar, galeri cloud langsung terbuka di HP mereka" },
  { before: "Ganti frame berarti panggil desainer dan install ulang", after: "Pilih dari marketplace, pasang satu klik" },
  { before: "Keliling cek booth, baru tahu rusak setelah ada komplain", after: "Status semua booth terlihat real-time dari HP" },
  { before: "Catat omzet manual, ujungnya selisih kas", after: "Riwayat dan grafik omzet otomatis, ekspor ke CSV" },
  { before: "Internet putus, sesi pelanggan hilang", after: "Sesi tersimpan di kiosk dan terkirim sendiri saat online" },
  { before: "Antrian pakai kertas atau teriak nama, kas dihitung dari ingatan", after: "Nomor antrian digital dan shift kasir dengan hitung laci yang tercatat" },
  { before: "Update aplikasi harus datangi tiap lokasi", after: "Update otomatis, tinggal atur per kiosk" },
];

export function Contrast() {
  return (
    <section id="bedanya" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-12 px-4 py-20 md:px-16">
      <SectionHeading eyebrow="Kenapa STUDIODO" title="Semua yang dulu ribet, sekarang jalan sendiri." />
      <div className="mx-auto grid w-full max-w-[980px] gap-3">
        <div className="hidden grid-cols-2 gap-6 px-6 text-[13px] font-semibold uppercase tracking-widest text-muted md:grid">
          <div className="flex items-end gap-3">
            <Figure expr="khawatir" pose="chin" hair="curly" skin={2} color={2} bob={false} className="w-[84px]" />
            <Figure expr="bingung" pose="down" hair="short" skin={1} color={0} glasses bob={false} className="w-[84px]" delay={0.6} />
            <span className="pb-3">Biasanya</span>
          </div>
          <div className="flex items-end gap-3 text-accent">
            <Figure expr="senang" pose="up" hair="hijab" skin={3} color={3} scarf="#7a6bff" className="w-[84px]" />
            <Figure expr="lega" pose="wave" hair="long" skin={1} color={1} jacket="#ff6b5a" className="w-[84px]" delay={0.8} />
            <span className="pb-3">Di STUDIODO</span>
          </div>
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
