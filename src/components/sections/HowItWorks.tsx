import { SectionHeading } from "../SectionHeading";
import type { HowData } from "@/lib/content";

export function HowItWorks({ data }: { data: HowData }) {
  return (
    <section className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-12 px-4 py-16 md:px-16">
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.steps.map((s, i) => (
          <li key={`${s.title}-${i}`} className="glass flex min-h-[240px] flex-col gap-4 p-8">
            <span className="font-display text-[44px] font-light text-accent">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-display text-[22px] tracking-tight">{s.title}</h3>
            <p className="text-[15px] leading-relaxed text-muted">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
