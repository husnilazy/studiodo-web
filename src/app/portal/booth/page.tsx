import { BoothManager, type BoothView } from "@/components/BoothManager";
import { PageHeader } from "@/components/dash/PageHeader";
import { fetchPublicPlans } from "@/lib/api";
import { getSiteContent, whatsappLink } from "@/lib/content";
import { getSummary, portalFetch } from "@/lib/portal";
import type { KioskKeyRow, VolumeTier } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function BoothPage() {
  const [summary, keys, plans, pricing, content] = await Promise.all([
    getSummary(),
    portalFetch<KioskKeyRow[]>("/api/kiosk-keys"),
    fetchPublicPlans(),
    portalFetch<{ tiers: VolumeTier[]; tenantPercent: number }>("/api/portal/billing/tiers"),
    getSiteContent(),
  ]);
  // The API already decides who is "online" (recent heartbeat), so every screen agrees on the same answer.
  const onlineById = new Map(summary.kiosks.map((k) => [k.id, k.online]));
  const booths: BoothView[] = keys.filter((k) => !k.revokedAt).map((k) => ({ ...k, online: onlineById.get(k.id) ?? false }));
  const lic = summary.licenses;
  const wa = whatsappLink(content.site, `Halo STUDIODO, saya butuh bantuan langganan booth untuk "${summary.tenant.name}".`);

  return (
    <div className="fit-page dash-stagger pb-6 lg:pb-0">
      <PageHeader eyebrow="Booth &amp; langganan" title="Kelola booth" intro={<>Satu key = satu booth = satu langganan. Booth yang masa aktifnya habis terkunci sendiri tanpa memengaruhi booth lain.
          {lic && lic.activeKeys > 0 && (
            <> Saat ini <strong className="text-foreground">{lic.activeKeys} booth</strong>: {lic.paid} berlangganan{lic.trial > 0 ? `, ${lic.trial} trial` : ""}{lic.unpaid > 0 ? `, ${lic.unpaid} belum berlangganan` : ""}{lic.locked > 0 ? ` — ${lic.locked} terkunci` : ""}.</>
          )}</>} />

      <BoothManager
        booths={booths}
        plans={plans ?? []}
        currentPlanSlug={summary.tenant.planSlug}
        tiers={pricing.tiers}
        tenantDiscountPercent={pricing.tenantPercent}
        canPay={summary.onlinePaymentEnabled}
        contactHref={wa}
      />
    </div>
  );
}
