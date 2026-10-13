import type { ReactNode } from "react";
import { PageHeader } from "@/components/dash/PageHeader";
import { KasirTabs } from "@/components/pos/KasirTabs";

export default function KasirLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-col gap-4 pb-6 lg:pb-0">
      <PageHeader eyebrow="Kasir" title="Kasir & antrian" intro="Terima pembayaran dari satu layar, kelola antrian, tutup shift dengan hitung kas, dan refund dengan PIN supervisor." />
      <KasirTabs />
      {children}
    </div>
  );
}
