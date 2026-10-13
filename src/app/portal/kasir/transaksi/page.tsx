import { OrdersPanel } from "@/components/pos/OrdersPanel";
import { portalFetch } from "@/lib/portal";
import type { PosCatalog, PosOrder, PosReport } from "@/lib/posTypes";

export const dynamic = "force-dynamic";

export default async function TransaksiPage() {
  const [orders, report, catalog] = await Promise.all([
    portalFetch<PosOrder[]>("/api/pos/orders?limit=200"),
    portalFetch<PosReport>("/api/pos/report?days=14"),
    portalFetch<PosCatalog>("/api/pos/catalog"),
  ]);
  return <OrdersPanel orders={orders} report={report} hasPin={catalog.settings.hasPin} />;
}
