import { KioskSettingsForm } from "@/components/KioskSettingsForm";
import { PageHeader } from "@/components/dash/PageHeader";
import { portalFetch } from "@/lib/portal";
import type { PrintingConfig, TenantConfig } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const [tenant, printing] = await Promise.all([
    portalFetch<TenantConfig>("/api/config/tenant"),
    portalFetch<PrintingConfig>("/api/config/printing"),
  ]);
  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader eyebrow="Kelola kiosk" title="Tampilan &amp; pengaturan" intro="Ubah brand, teks, warna, dan aturan sesi dari sini. Semua kiosk Anda memuat pengaturan ini otomatis saat tersambung internet.
          Pengaturan perangkat (kamera, printer) tetap diatur di aplikasi kiosk karena berbeda untuk tiap komputer." />
      <KioskSettingsForm tenant={tenant} printing={printing} />
    </div>
  );
}
