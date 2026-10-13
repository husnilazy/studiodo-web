import { PackageManager } from "@/components/PackageManager";
import { portalFetch } from "@/lib/portal";
import type { PackageRow } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function PaketPage() {
  const [packages, features] = await Promise.all([
    portalFetch<PackageRow[]>("/api/packages/all"),
    portalFetch<{ gifVideoEnabled: boolean }>("/api/config/plan-features"),
  ]);
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Kelola kiosk</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Paket foto</h1>
        <p className="mt-2 max-w-[620px] text-[15px] text-muted">Paket yang tampil di layar &ldquo;Pilih paket&rdquo; semua kiosk Anda. Perubahan langsung berlaku di kiosk begitu kiosk memuat ulang data (beberapa detik).</p>
      </div>
      <PackageManager packages={packages} mediaLocked={!features.gifVideoEnabled} />
    </div>
  );
}
