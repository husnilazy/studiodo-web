import { WithdrawalPanel } from "@/components/WithdrawalPanel";
import { PageHeader } from "@/components/dash/PageHeader";
import { portalFetch } from "@/lib/portal";
import type { WithdrawalsData } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function SaldoPage() {
  const data = await portalFetch<WithdrawalsData>("/api/withdrawals");
  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader eyebrow="Ringkasan" title="Saldo QRIS" intro="Untuk akun yang pembayaran QRIS-nya ditampung STUDIODO: lihat saldo dan ajukan penarikan ke rekening atau e-wallet Anda." />
      <WithdrawalPanel data={data} />
    </div>
  );
}
