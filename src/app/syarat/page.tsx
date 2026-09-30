import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Syarat dan Ketentuan", robots: { index: false } };

export default function SyaratPage() {
  return (
    <PageShell eyebrow="Legal" title="Syarat dan Ketentuan." narrow>
      <div className="glass flex flex-col gap-4 p-8 text-[15px] leading-relaxed text-muted">
        <p className="rounded-2xl bg-[#fff3d6] px-4 py-3 text-[#7a5a00]">
          [DRAF — syarat dan ketentuan perlu disusun dan ditinjau sebelum website diluncurkan. Jangan dipublikasikan dalam bentuk ini.]
        </p>
        <p>[Ketentuan langganan, masa trial, pembatalan, penggunaan lisensi per kiosk, dan tanggung jawab.]</p>
      </div>
    </PageShell>
  );
}
