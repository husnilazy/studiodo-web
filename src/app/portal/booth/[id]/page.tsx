import { notFound } from "next/navigation";
import { BoothSettingsForm } from "@/components/BoothSettingsForm";
import { PageHeader } from "@/components/dash/PageHeader";
import { portalCall } from "@/lib/portal";
import type { BoothDetail } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function BoothSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const result = await portalCall<BoothDetail>("GET", `/api/booths/${id}`);
  if (!result.ok) {
    if (result.status === 404) notFound();
    throw new Error(result.error);
  }
  const booth = result.data;
  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader eyebrow="Booth &amp; langganan" title={`Pengaturan: ${booth.booth.label || "Booth"}`} intro="Harga paket dan tampilan khusus untuk booth ini. Yang dikosongkan mengikuti pengaturan utama." />
      <BoothSettingsForm detail={booth} />
    </div>
  );
}
