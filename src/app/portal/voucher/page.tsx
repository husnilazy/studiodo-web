import { VoucherManager } from "@/components/VoucherManager";
import { portalFetch } from "@/lib/portal";
import type { VoucherRow } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function VoucherPage() {
  const [vouchers, report] = await Promise.all([
    portalFetch<VoucherRow[]>("/api/vouchers"),
    portalFetch<{ summary: { totalRedemptions: number; totalDiscountGiven: number; totalRevenueAfterDiscount: number } }>("/api/vouchers/report?limit=1"),
  ]);
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Kelola kiosk</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Voucher</h1>
        <p className="mt-2 max-w-[620px] text-[15px] text-muted">Kode diskon atau gratis yang bisa dimasukkan pelanggan di layar pembayaran kiosk. Buat satu kode, atau satu batch untuk dibagikan.</p>
      </div>
      <VoucherManager vouchers={vouchers} report={report.summary} />
    </div>
  );
}
