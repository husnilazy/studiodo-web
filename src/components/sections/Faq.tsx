import { SectionHeading } from "../SectionHeading";
import type { FaqData } from "@/lib/content";

export function Faq({ data }: { data: FaqData }) {
  const faqs = data.items;
  return (
    <section id="faq" className="relative z-10 mx-auto grid w-full max-w-[1312px] items-start gap-10 px-4 py-20 md:px-16 lg:grid-cols-[420px_1fr] lg:gap-16">
      <SectionHeading align="left" eyebrow={data.eyebrow} title={data.title} />
      <div className="glass px-8 py-2">
        {faqs.map((f, i) => (
          <details key={`${f.q}-${i}`} open={i === 0} className={`group py-5 ${i < faqs.length - 1 ? "border-b border-foreground/[0.08]" : ""}`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg tracking-tight [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden="true" className="text-2xl font-light text-muted transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2.5 whitespace-pre-line text-[15px] leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
