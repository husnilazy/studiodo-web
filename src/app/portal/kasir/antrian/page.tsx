import { QueueBoard } from "@/components/pos/QueueBoard";
import { portalFetch } from "@/lib/portal";
import type { PosCatalog, PosTicket } from "@/lib/posTypes";

export const dynamic = "force-dynamic";

export default async function AntrianPage() {
  const [tickets, catalog] = await Promise.all([portalFetch<PosTicket[]>("/api/pos/queue"), portalFetch<PosCatalog>("/api/pos/catalog")]);
  return <QueueBoard initial={tickets} booths={catalog.booths} />;
}
