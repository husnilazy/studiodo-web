import { LiveMonitor } from "@/components/LiveMonitor";
import { portalFetch } from "@/lib/portal";
import type { LiveData } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function MonitorPage() {
  const initial = await portalFetch<LiveData>("/api/live");
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Ringkasan</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Monitor booth</h1>
        <p className="mt-2 max-w-[660px] text-[15px] text-muted">
          Pantau semua booth dalam satu akun secara langsung: siapa yang sedang sesi foto, menunggu pembayaran, atau offline — lengkap dengan pendapatan hari ini.
        </p>
      </div>
      <LiveMonitor initial={initial} />
    </div>
  );
}
