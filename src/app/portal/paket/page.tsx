import { PackageManager } from "@/components/PackageManager";
import { PageHeader } from "@/components/dash/PageHeader";
import { portalFetch } from "@/lib/portal";
import type { PackageRow } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function PaketPage() {
  const [packages, features] = await Promise.all([
    portalFetch<PackageRow[]>("/api/packages/all"),
    portalFetch<{ gifVideoEnabled: boolean }>("/api/config/plan-features"),
  ]);
  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader eyebrow="Kelola kiosk" title="Paket foto" intro="Paket yang tampil di layar &ldquo;Pilih paket&rdquo; semua kiosk Anda. Perubahan langsung berlaku di kiosk begitu kiosk memuat ulang data (beberapa detik)." />
      <PackageManager packages={packages} mediaLocked={!features.gifVideoEnabled} />
    </div>
  );
}
