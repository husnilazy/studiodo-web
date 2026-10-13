import { CrmManager } from "@/components/CrmManager";
import { PageHeader } from "@/components/dash/PageHeader";
import { portalFetch } from "@/lib/portal";
import type { CrmList } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function PelangganPage() {
  const [initial, tenant] = await Promise.all([
    portalFetch<CrmList>("/api/crm/customers?limit=20"),
    portalFetch<{ brandName?: string }>("/api/config/tenant"),
  ]);
  return (
    <div className="fit-page dash-stagger pb-6 lg:pb-0">
      <PageHeader
        eyebrow="Ringkasan"
        title="Pelanggan (CRM)"
        intro={<>Semua orang yang meninggalkan nomor WhatsApp atau email di kiosk Anda, digabung per orang. Ketuk <strong className="text-foreground">WhatsApp</strong> untuk langsung menyapa, atau buka satu pelanggan untuk riwayat, catatan, dan label.</>}
      />
      <CrmManager initial={initial} brand={tenant.brandName ?? "kami"} />
    </div>
  );
}
