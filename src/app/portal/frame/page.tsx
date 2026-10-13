import Link from "next/link";
import { FrameManager } from "@/components/FrameManager";
import { portalFetch } from "@/lib/portal";
import type { FrameRow } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function FramePage() {
  const frames = await portalFetch<FrameRow[]>("/api/frames/manage");
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Kelola kiosk</div>
          <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Frame &amp; template</h1>
          <p className="mt-2 max-w-[620px] text-[15px] text-muted">
            Frame yang aktif muncul di layar &ldquo;Pilih frame&rdquo; kiosk. Sembunyikan frame yang sedang tidak dipakai tanpa menghapusnya.
            Mendesain frame baru dilakukan di aplikasi STUDIODO (Kelola Frame); atau pasang template siap pakai dari katalog.
          </p>
        </div>
        <Link href="/portal/template" className="btn btn-primary px-6 py-3">Pasang dari katalog</Link>
      </div>
      <FrameManager frames={frames} />
    </div>
  );
}
