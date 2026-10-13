import Link from "next/link";
import { PageHeader } from "@/components/dash/PageHeader";
import { FrameManager } from "@/components/FrameManager";
import { portalFetch } from "@/lib/portal";
import type { FrameRow } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function FramePage() {
  const frames = await portalFetch<FrameRow[]>("/api/frames/manage");
  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader eyebrow="Kelola kiosk" title="Frame &amp; template" intro="Frame yang aktif muncul di layar &ldquo;Pilih frame&rdquo; kiosk. Sembunyikan frame yang sedang tidak dipakai tanpa menghapusnya.
            Mendesain frame baru dilakukan di aplikasi STUDIODO (Kelola Frame); atau pasang template siap pakai dari katalog." />
        <Link href="/portal/template" className="btn btn-primary px-6 py-3">Pasang dari katalog</Link>
      </div>
      <FrameManager frames={frames} />
    </div>
  );
}
