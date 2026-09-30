import type { ReactNode } from "react";
import { PageShell } from "./PageShell";
import { getSite, whatsappLink } from "@/lib/content";

export type LegalSection = { title: string; body: ReactNode };

/** Shared layout for the legal pages. `updated` is shown so readers know which version they are reading. */
export async function LegalDoc({ eyebrow, title, updated, intro, sections }: { eyebrow: string; title: string; updated: string; intro: string; sections: LegalSection[] }) {
  const site = await getSite();
  const wa = whatsappLink(site);
  return (
    <PageShell eyebrow={eyebrow} title={title} intro={intro} narrow>
      <p className="mb-6 text-[13px] text-muted">Terakhir diperbarui: {updated}</p>
      <div className="glass flex flex-col gap-8 p-8 md:p-10">
        {sections.map((s, i) => (
          <section key={s.title} className="flex flex-col gap-3">
            <h2 className="font-display text-xl tracking-tight">{i + 1}. {s.title}</h2>
            <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-muted [&_a]:font-semibold [&_a]:text-accent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-accent [&_li]:mt-1.5">{s.body}</div>
          </section>
        ))}
        <section className="flex flex-col gap-3 border-t border-foreground/10 pt-6">
          <h2 className="font-display text-xl tracking-tight">Kontak</h2>
          <p className="text-[15px] leading-relaxed text-muted">
            Pertanyaan tentang dokumen ini dapat disampaikan ke Frameless Creative
            {site.supportEmail ? <> melalui <a href={`mailto:${site.supportEmail}`} className="font-semibold text-accent">{site.supportEmail}</a></> : null}
            {wa ? <>{site.supportEmail ? " atau " : " melalui "}<a href={wa} className="font-semibold text-accent">WhatsApp</a></> : null}
            {!site.supportEmail && !wa ? <> melalui <a href="/kontak" className="font-semibold text-accent">halaman kontak</a></> : null}.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
