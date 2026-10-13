import { PosTerminal } from "@/components/pos/PosTerminal";
import { portalFetch } from "@/lib/portal";
import type { PosCatalog } from "@/lib/posTypes";

export const dynamic = "force-dynamic";

export default async function KasirPage() {
  const catalog = await portalFetch<PosCatalog>("/api/pos/catalog");
  return <PosTerminal catalog={catalog} />;
}
