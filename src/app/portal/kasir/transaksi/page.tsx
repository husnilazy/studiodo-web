import { OrdersPanel } from "@/components/pos/OrdersPanel";
import { portalFetch } from "@/lib/portal";
import type { PosOrder, PosReport, PosSettings } from "@/lib/posTypes";

export const dynamic = "force-dynamic";

export default async function TransaksiPage() {
  const [orders, report, settings] = await Promise.all([
    portalFetch<PosOrder[]>("/api/pos/orders?limit=100"),
    portalFetch<PosReport>("/api/pos/report?days=14"),
    portalFetch<PosSettings>("/api/pos/settings"),
  ]);
  return <OrdersPanel orders={orders} report={report} hasPin={settings.hasPin} />;
}
