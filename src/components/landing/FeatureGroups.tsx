import { SectionHeading } from "../SectionHeading";
import { Icon, IconTile } from "../Icon";
import { FEATURE_GROUPS } from "./featureData";

export function FeatureGroups() {
  return (
    <section id="semua-fitur" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-12 px-4 py-20 md:px-16">
      <SectionHeading eyebrow="Semua fitur" title="Lengkap dari kamera sampai rekening." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURE_GROUPS.map((g, gi) => (
          <article key={g.title} data-reveal="up" data-delay={String((gi % 3) * 110)} className="glass lift flex flex-col gap-5 p-7 sm:p-8">
            <div className="flex items-center gap-4">
              <IconTile name={g.icon} tint={g.tint} size="md" />
              <h3 className="font-display text-[22px] tracking-tight">{g.title}</h3>
            </div>
            <ul className="flex flex-col gap-2.5">
              {g.items.map((it, i) => (
                <li key={it} className="feature-li flex items-start gap-2.5 text-[15px] leading-snug text-muted" style={{ ["--i" as string]: i }}>
                  <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"><Icon name="check" className="h-2.5 w-2.5" /></span>
                  {it}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
