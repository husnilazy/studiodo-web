import { CrmManager } from "@/components/CrmManager";
import { portalFetch } from "@/lib/portal";
import type { CrmList } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function PelangganPage() {
  const [initial, tenant] = await Promise.all([
    portalFetch<CrmList>("/api/crm/customers?limit=20"),
    portalFetch<{ brandName?: string }>("/api/config/tenant"),
  ]);
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Ringkasan</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Pelanggan (CRM)</h1>
        <p className="mt-2 max-w-[660px] text-[15px] text-muted">
          Semua orang yang meninggalkan nomor WhatsApp atau email di kiosk Anda, digabung per orang. Ketuk <strong className="text-foreground">WhatsApp</strong> untuk langsung menyapa,
          atau buka satu pelanggan untuk melihat riwayat sesi, menambah catatan dan label.
        </p>
      </div>
      <CrmManager initial={initial} brand={tenant.brandName ?? "kami"} />
    </div>
  );
}
