import { SectionHeading } from "../SectionHeading";
import { Icon, IconTile } from "../Icon";

const ITEMS = [
  { icon: "camera", tint: "from-[#c7ceff] to-[#edefff]", title: "Kamera", lead: "Webcam atau DSLR / mirrorless", points: ["Terhubung lewat digiCamControl", "ISO, shutter, aperture, white balance diatur dari dashboard", "Live view hanya aktif saat dibutuhkan"] },
  { icon: "printer", tint: "from-[#ffd3e4] to-[#fff0f6]", title: "Printer", lead: "Printer apa saja berdriver Windows", points: ["Strip, grid, atau satu foto", "Pilih mode cermin atau asli untuk hasil cetak", "Cetak tambahan berbayar lewat QRIS"] },
  { icon: "monitor", tint: "from-[#b8f0e6] to-[#eafbf8]", title: "PC & layar", lead: "Windows 10/11 (64-bit)", points: ["Layar sentuh untuk pengalaman kiosk", "Portrait atau landscape", "Update aplikasi otomatis, tinggal diatur per kiosk"] },
  { icon: "wallet", tint: "from-[#ffe3b8] to-[#fff6e6]", title: "Pembayaran", lead: "QRIS lewat akun Xendit Anda", points: ["Dana mengikuti jadwal pencairan Xendit", "Voucher, paket gratis, dan saldo di dashboard", "STUDIODO tidak menahan uang pelanggan Anda"] },
];

export function Hardware() {
  return (
    <section id="perangkat" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-12 px-4 py-20 md:px-16">
      <SectionHeading eyebrow="Perangkat" title="Pakai perangkat yang sudah Anda punya." />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((it, i) => (
          <article key={it.title} data-reveal="up" data-delay={String(i * 100)} className="glass lift flex flex-col gap-4 p-7">
            <IconTile name={it.icon} tint={it.tint} />
            <div>
              <h3 className="font-display text-[22px] tracking-tight">{it.title}</h3>
              <p className="mt-1 text-[14px] font-semibold text-accent">{it.lead}</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {it.points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[14px] leading-snug text-muted">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"><Icon name="check" className="h-2.5 w-2.5" /></span>
                  {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
