import { VoucherManager } from "@/components/VoucherManager";
import { PageHeader } from "@/components/dash/PageHeader";
import { portalFetch } from "@/lib/portal";
import type { VoucherRow } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function VoucherPage() {
  const [vouchers, report] = await Promise.all([
    portalFetch<VoucherRow[]>("/api/vouchers"),
    portalFetch<{ summary: { totalRedemptions: number; totalDiscountGiven: number; totalRevenueAfterDiscount: number } }>("/api/vouchers/report?limit=1"),
  ]);
  return (
    <div className="fit-page dash-stagger pb-6 lg:pb-0">
      <PageHeader eyebrow="Kelola kiosk" title="Voucher" intro="Kode diskon atau gratis yang bisa dimasukkan pelanggan di layar pembayaran kiosk. Buat satu kode, atau satu batch untuk dibagikan." />
      <VoucherManager vouchers={vouchers} report={report.summary} />
    </div>
  );
}
