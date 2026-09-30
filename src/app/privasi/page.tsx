import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Kebijakan Privasi", robots: { index: false } };

export default function PrivasiPage() {
  return (
    <PageShell eyebrow="Legal" title="Kebijakan Privasi." narrow>
      <div className="glass flex flex-col gap-4 p-8 text-[15px] leading-relaxed text-muted">
        <p className="rounded-2xl bg-[#fff3d6] px-4 py-3 text-[#7a5a00]">
          [DRAF — teks kebijakan privasi perlu disusun dan ditinjau sebelum website diluncurkan. Jangan dipublikasikan dalam bentuk ini.]
        </p>
        <p>[Data apa yang dikumpulkan (data pengajuan tenant, foto pelanggan booth), tujuan penggunaan, lama penyimpanan, hak pengguna, dan kontak.]</p>
      </div>
    </PageShell>
  );
}
