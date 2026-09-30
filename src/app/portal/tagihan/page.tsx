import { CheckoutButton } from "@/components/CheckoutButton";
import { fetchPublicPlans } from "@/lib/api";
import { getSiteContent, whatsappLink } from "@/lib/content";
import { getOrders, getSummary } from "@/lib/portal";
import { formatDate, formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  paid: { label: "Lunas", tone: "bg-[#dff7ec] text-[#0f6b45]" },
  pending: { label: "Menunggu pembayaran", tone: "bg-[#fff3d6] text-[#7a5a00]" },
  failed: { label: "Gagal", tone: "bg-[#ffe3e3] text-[#a12626]" },
  expired: { label: "Kedaluwarsa", tone: "bg-foreground/[0.06] text-muted" },
};

export default async function TagihanPage({ searchParams }: PageProps<"/portal/tagihan">) {
  const sp = await searchParams;
  const [summary, orders, plans, content] = await Promise.all([getSummary(), getOrders(), fetchPublicPlans(), getSiteContent()]);
  const wa = whatsappLink(content.site, `Halo STUDIODO, saya ingin perpanjang langganan untuk "${summary.tenant.name}".`);
  const paidPlans = (plans ?? []).filter((p) => Number(p.price) > 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Langganan</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Langganan &amp; tagihan</h1>
        <p className="mt-2 text-[15px] text-muted">
          Paket saat ini: <strong className="text-foreground">{summary.tenant.planName}</strong>
          {summary.tenant.subscriptionEndsAt && <> · berlaku sampai {formatDate(summary.tenant.subscriptionEndsAt)}</>}
        </p>
      </div>

      {sp.status === "selesai" && (
        <p role="status" className="rounded-2xl bg-[#dff7ec] px-5 py-4 text-sm text-[#0f6b45]">
          Terima kasih! Pembayaran sedang diproses. Masa aktif diperbarui otomatis begitu pembayaran terkonfirmasi (biasanya beberapa menit).
        </p>
      )}

      {!summary.onlinePaymentEnabled && (
        <div className="glass p-6 text-[15px] leading-relaxed text-muted">
          Pembayaran online belum diaktifkan. Untuk memperpanjang langganan, hubungi tim STUDIODO
          {wa ? <> via <a href={wa} className="font-semibold text-accent underline underline-offset-4">WhatsApp</a></> : null}.
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paidPlans.length === 0 && <p className="text-[15px] text-muted">Daftar paket belum tersedia.</p>}
        {paidPlans.map((p) => {
          const current = p.slug === summary.tenant.planSlug;
          const period = p.billingInterval === "yearly" ? "tahun" : "bulan";
          return (
            <article key={p.slug} className="glass flex flex-col gap-4 p-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl tracking-tight">{p.name}</h2>
                {current && <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Paket Anda</span>}
              </div>
              <div><span className="font-display text-4xl tracking-tight">{formatRupiah(Number(p.price))}</span><span className="text-muted"> /{period}</span></div>
              {p.description && <p className="text-[15px] text-muted">{p.description}</p>}
              <p className="text-[13px] text-muted">{p.kioskLimit === null ? "Kiosk tak terbatas" : `${p.kioskLimit} kiosk`}</p>
              {summary.onlinePaymentEnabled && (
                <div className="mt-auto"><CheckoutButton planSlug={p.slug} label={current ? `Perpanjang 1 ${period}` : "Pilih paket ini"} featured={false} /></div>
              )}
            </article>
          );
        })}
      </section>

      <section className="glass p-8">
        <h2 className="mb-4 font-display text-xl tracking-tight">Riwayat pembayaran online</h2>
        {orders.length === 0 ? (
          <p className="text-[15px] text-muted">Belum ada transaksi.</p>
        ) : (
          <ul className="divide-y divide-foreground/[0.08]">
            {orders.map((o) => {
              const st = ORDER_STATUS[o.status] ?? ORDER_STATUS.pending;
              return (
                <li key={o.orderId} className="flex flex-wrap items-center justify-between gap-3 py-3.5 text-[15px]">
                  <div>
                    <div className="font-semibold">{o.planName} · {o.periodDays} hari</div>
                    <div className="text-[13px] text-muted">{o.orderId} · {formatDate(o.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatRupiah(o.amount)}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.tone}`}>{st.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
