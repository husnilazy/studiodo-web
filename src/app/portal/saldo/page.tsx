import { WithdrawalPanel } from "@/components/WithdrawalPanel";
import { portalFetch } from "@/lib/portal";
import type { WithdrawalsData } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function SaldoPage() {
  const data = await portalFetch<WithdrawalsData>("/api/withdrawals");
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Ringkasan</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Saldo QRIS</h1>
        <p className="mt-2 max-w-[620px] text-[15px] text-muted">Untuk akun yang pembayaran QRIS-nya ditampung STUDIODO: lihat saldo dan ajukan penarikan ke rekening atau e-wallet Anda.</p>
      </div>
      <WithdrawalPanel data={data} />
    </div>
  );
}
