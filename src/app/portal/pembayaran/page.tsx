import { PaymentSettingsForm } from "@/components/PaymentSettingsForm";
import { PageHeader } from "@/components/dash/PageHeader";
import { portalFetch } from "@/lib/portal";
import type { PaymentConfig } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function PembayaranPage() {
  const config = await portalFetch<PaymentConfig>("/api/config/payment");
  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader eyebrow="Kelola kiosk" title="Pembayaran kiosk" intro="Pilih ke mana uang QRIS dari kiosk masuk: akun STUDIODO (tanpa perlu akun gateway, ditarik dari saldo) atau akun Xendit/DOKU Anda sendiri. Kunci disimpan terenkripsi dan tidak pernah ditampilkan lagi setelah disimpan." />
      <PaymentSettingsForm config={config} />
    </div>
  );
}
