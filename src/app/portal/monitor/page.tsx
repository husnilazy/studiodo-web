import { LiveMonitor } from "@/components/LiveMonitor";
import { PageHeader } from "@/components/dash/PageHeader";
import { portalFetch } from "@/lib/portal";
import type { LiveData } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function MonitorPage() {
  const initial = await portalFetch<LiveData>("/api/live");
  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader eyebrow="Ringkasan" title="Monitor booth" intro="Pantau semua booth dalam satu akun secara langsung: siapa yang sedang sesi foto, menunggu pembayaran, atau offline — lengkap dengan pendapatan hari ini." />
      <LiveMonitor initial={initial} />
    </div>
  );
}
