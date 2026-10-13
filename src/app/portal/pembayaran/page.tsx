import { PaymentSettingsForm } from "@/components/PaymentSettingsForm";
import { portalFetch } from "@/lib/portal";
import type { PaymentConfig } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function PembayaranPage() {
  const config = await portalFetch<PaymentConfig>("/api/config/payment");
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Kelola kiosk</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Pembayaran kiosk</h1>
        <p className="mt-2 max-w-[620px] text-[15px] text-muted">
          Hubungkan akun Xendit atau DOKU Anda agar pembayaran QRIS pelanggan masuk langsung ke rekening Anda. Kunci disimpan terenkripsi dan tidak pernah ditampilkan lagi setelah disimpan.
        </p>
      </div>
      <PaymentSettingsForm config={config} />
    </div>
  );
}
