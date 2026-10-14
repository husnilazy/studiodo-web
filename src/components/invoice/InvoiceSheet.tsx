import type { Invoice, InvoiceStatus } from "@/lib/invoice";

// The invoice document. Deliberately fixed light colours (not theme tokens): it is a document people print or save as PDF,
// so it must look the same in dark mode. Layout is a single A4-ish column that collapses cleanly on a phone.

const rupiah = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
const long = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
const dt = (iso: string) => new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) + " WIB";

const STATUS: Record<InvoiceStatus, { label: string; chip: string; stamp: string; stampText: string }> = {
  paid: { label: "Lunas", chip: "bg-[#dff7ec] text-[#0f6b45]", stamp: "border-[#22c58b] text-[#22c58b]", stampText: "LUNAS" },
  pending: { label: "Menunggu pembayaran", chip: "bg-[#fff3d6] text-[#7a5a00]", stamp: "border-[#f5a524] text-[#f5a524]", stampText: "BELUM DIBAYAR" },
  failed: { label: "Gagal", chip: "bg-[#ffe3e3] text-[#a12626]", stamp: "border-[#e0455a] text-[#e0455a]", stampText: "GAGAL" },
  expired: { label: "Kedaluwarsa", chip: "bg-[#eceef6] text-[#5b6478]", stamp: "border-[#9aa1b2] text-[#9aa1b2]", stampText: "KEDALUWARSA" },
};

function Party({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#7b849c]">{title}</div>
      <div className="text-[14px] leading-relaxed text-[#2b3350]">{children}</div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b849c]">{label}</div>
      <div className="mt-1 text-[14px] font-semibold text-[#0b1020]">{value}</div>
    </div>
  );
}

export function InvoiceSheet({ invoice: v }: { invoice: Invoice }) {
  const st = STATUS[v.status];
  const paid = v.status === "paid";
  return (
    <article className="relative mx-auto w-full max-w-[820px] overflow-hidden rounded-[28px] bg-white text-[#0b1020] shadow-[0_30px_80px_-30px_rgba(40,48,120,0.45)] ring-1 ring-black/5 print:max-w-none print:rounded-none print:shadow-none print:ring-0">
      {/* brand band */}
      <header className="relative bg-[#4f4fe8] bg-gradient-to-br from-[#4f4fe8] via-[#6f6fff] to-[#9aa6ff] px-7 py-7 text-white sm:px-10 print:py-5">
        <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#ffc8de]/30 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display text-[26px] font-semibold tracking-tight">{v.seller.name}</div>
            <div className="text-[12.5px] text-white/75">{v.seller.company} · {v.seller.website}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/75">Invoice</div>
            <div className="mt-1 font-mono text-[15px] font-semibold tracking-wide">{v.invoiceNumber}</div>
          </div>
        </div>
      </header>

      {/* diagonal status stamp */}
      <div aria-hidden="true" className={`pointer-events-none absolute right-6 top-[150px] hidden -rotate-12 sm:block select-none rounded-xl border-[3px] px-4 py-1.5 font-display text-[22px] font-bold tracking-[0.12em] opacity-[0.22] sm:right-14 sm:top-[140px] sm:text-[30px] ${st.stamp}`}>
        {st.stampText}
      </div>

      <div className="px-7 py-8 sm:px-10 print:py-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className={`inline-block rounded-full px-3.5 py-1.5 text-[12px] font-bold ${st.chip}`}>{st.label}</span>
            <div className="mt-4 text-[13px] text-[#7b849c]">{paid ? "Total dibayar" : "Total tagihan"}</div>
            <div className="font-display text-[40px] font-semibold leading-none tracking-tight sm:text-[48px]">{rupiah(v.total)}</div>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-3">
            <Meta label="Tanggal invoice" value={long(v.issuedAt)} />
            {paid && v.paidAt ? <Meta label="Dibayar pada" value={dt(v.paidAt)} /> : v.dueAt ? <Meta label="Bayar sebelum" value={dt(v.dueAt)} /> : null}
            {v.paymentMethod && paid ? <Meta label="Metode" value={v.paymentMethod} /> : null}
          </div>
        </div>

        <div className="mt-9 grid gap-7 border-t border-[#e9ebf5] pt-7 sm:grid-cols-2">
          <Party title="Diterbitkan oleh">
            <div className="font-semibold text-[#0b1020]">{v.seller.name} · {v.seller.company}</div>
            {v.seller.email && <div>{v.seller.email}</div>}
            {v.seller.whatsapp && <div>WhatsApp +{v.seller.whatsapp}</div>}
            <div>{v.seller.website}</div>
          </Party>
          <Party title="Ditagihkan kepada">
            <div className="font-semibold text-[#0b1020]">{v.customer.businessName}</div>
            {v.customer.ownerName && <div>{v.customer.ownerName}</div>}
            {v.customer.email && <div>{v.customer.email}</div>}
            {(v.customer.address || v.customer.city) && <div>{[v.customer.address, v.customer.city].filter(Boolean).join(", ")}</div>}
          </Party>
        </div>

        {/* line items */}
        <div className="mt-9 overflow-hidden rounded-2xl ring-1 ring-[#e9ebf5]">
          <div className="hidden grid-cols-[1fr_70px_130px_140px] bg-[#f6f7ff] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7b849c] sm:grid">
            <span>Deskripsi</span><span className="text-center">Booth</span><span className="text-right">Harga / booth</span><span className="text-right">Jumlah</span>
          </div>
          <div className="grid gap-1 px-5 py-5 sm:grid-cols-[1fr_70px_130px_140px] sm:items-start">
            <div>
              <div className="text-[15px] font-semibold">Langganan STUDIODO — paket {v.plan}</div>
              <div className="mt-0.5 text-[13px] text-[#7b849c]">Masa aktif {v.periodDays} hari per booth</div>
            </div>
            <div className="text-[14px] sm:text-center"><span className="text-[#7b849c] sm:hidden">Booth: </span>{v.boothCount}</div>
            <div className="text-[14px] tabular-nums sm:text-right"><span className="text-[#7b849c] sm:hidden">Harga / booth: </span>{rupiah(v.unitPrice)}</div>
            <div className="text-[14px] font-semibold tabular-nums sm:text-right">{rupiah(v.subtotal)}</div>
          </div>
          {v.booths.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-[#eef0f8] bg-[#fafbff] px-5 py-3.5">
              {v.booths.slice(0, 24).map((b, i) => <span key={`${b}-${i}`} className="rounded-full bg-[#eef0fb] px-3 py-1 text-[12px] font-medium text-[#3b3fb0]">{b}</span>)}
              {v.booths.length > 24 && <span className="rounded-full bg-[#eef0fb] px-3 py-1 text-[12px] font-medium text-[#3b3fb0]">+{v.booths.length - 24} lainnya</span>}
            </div>
          )}
        </div>

        {/* totals */}
        <div className="mt-5 ml-auto w-full max-w-[340px] text-[14px]">
          <div className="flex justify-between py-1.5"><span className="text-[#7b849c]">Subtotal</span><span className="tabular-nums">{rupiah(v.subtotal)}</span></div>
          {v.discountPercent > 0 && <div className="flex justify-between py-1.5"><span className="text-[#7b849c]">Diskon {v.discountPercent}%</span><span className="tabular-nums text-[#0f6b45]">−{rupiah(v.discountAmount)}</span></div>}
          <div className="mt-2 flex items-baseline justify-between border-t-2 border-[#0b1020] pt-3"><span className="font-semibold">Total</span><span className="font-display text-[24px] font-semibold tabular-nums">{rupiah(v.total)}</span></div>
        </div>

        <div className="mt-9 rounded-2xl bg-[#f6f7ff] px-5 py-4 text-[13px] leading-relaxed text-[#2b3350]">
          {paid
            ? <>Pembayaran ini sudah kami terima dan masa aktif booth sudah diperbarui. Dokumen ini adalah bukti pembayaran yang sah; simpan atau cetak sebagai PDF.</>
            : v.status === "pending"
              ? <>Selesaikan pembayaran lewat tombol <strong>Bayar sekarang</strong>. Masa aktif booth diperbarui otomatis begitu pembayaran terkonfirmasi, biasanya dalam beberapa menit.</>
              : <>Invoice ini tidak lagi bisa dibayar. Buat pesanan baru dari menu <em>Booth &amp; langganan</em> di dashboard Anda.</>}
        </div>
      </div>

      <footer className="border-t border-[#e9ebf5] bg-[#fafbff] px-7 py-5 text-[12px] leading-relaxed text-[#7b849c] sm:px-10">
        Invoice ini dibuat otomatis oleh sistem {v.seller.name} dan sah tanpa tanda tangan.
        {v.seller.email ? <> Pertanyaan tentang tagihan? Hubungi {v.seller.email}.</> : null}
      </footer>
    </article>
  );
}
