import Link from "next/link";
import { PageHeader } from "@/components/dash/PageHeader";
import { CustomFrameManager } from "@/components/CustomFrameManager";
import { portalFetch } from "@/lib/portal";
import type { FrameRow } from "@/lib/portalTypes";

export const dynamic = "force-dynamic";

export default async function CustomFramePage() {
  const all = await portalFetch<FrameRow[]>("/api/frames/manage");
  const frames = all.filter((f) => f.category === "__custom");
  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader eyebrow="Kelola kiosk" title="Frame custom" intro="Frame desain khusus pelanggan. Unggah desain mereka, beri harga, lalu jual lewat Kasir bersama paket foto. Pelanggan menerima voucher; saat voucher dimasukkan di kiosk, sesi langsung memakai frame itu (tanpa memilih frame)." />
        <Link href="/portal/frame" className="btn glass rounded-full! px-5 py-3 text-[14px]">← Frame &amp; template</Link>
      </div>
      <CustomFrameManager frames={frames} />
    </div>
  );
}
