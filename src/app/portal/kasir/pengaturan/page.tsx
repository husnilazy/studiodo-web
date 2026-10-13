import { PosSettingsPanel } from "@/components/pos/PosSettingsPanel";
import { portalFetch } from "@/lib/portal";
import type { PosProduct, PosSettings } from "@/lib/posTypes";

export const dynamic = "force-dynamic";

export default async function PengaturanKasirPage() {
  const [products, settings] = await Promise.all([portalFetch<PosProduct[]>("/api/pos/products"), portalFetch<PosSettings>("/api/pos/settings")]);
  return <PosSettingsPanel products={products} settings={settings} />;
}
