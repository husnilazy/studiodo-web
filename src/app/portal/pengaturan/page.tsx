import { KioskSettingsForm } from "@/components/KioskSettingsForm";
import { portalFetch } from "@/lib/portal";
import type { PrintingConfig, TenantConfig } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const [tenant, printing] = await Promise.all([
    portalFetch<TenantConfig>("/api/config/tenant"),
    portalFetch<PrintingConfig>("/api/config/printing"),
  ]);
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Kelola kiosk</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Tampilan &amp; pengaturan</h1>
        <p className="mt-2 max-w-[640px] text-[15px] text-muted">
          Ubah brand, teks, warna, dan aturan sesi dari sini. Semua kiosk Anda memuat pengaturan ini otomatis saat tersambung internet.
          Pengaturan perangkat (kamera, printer) tetap diatur di aplikasi kiosk karena berbeda untuk tiap komputer.
        </p>
      </div>
      <KioskSettingsForm tenant={tenant} printing={printing} />
    </div>
  );
}
