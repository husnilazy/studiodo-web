import { SectionHeading } from "../SectionHeading";
import type { FeaturesData } from "@/lib/content";

const tints = [
  "from-[#c7ceff] to-[#edefff]",
  "from-[#ffd3e4] to-[#fff0f6]",
  "from-[#b8f0e6] to-[#eafbf8]",
  "from-[#ffe3b8] to-[#fff6e6]",
  "from-[#bfd8ff] to-[#eaf2ff]",
];

export function Features({ data }: { data: FeaturesData }) {
  const last = data.items.length - 1;
  return (
    <section id="fitur" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-14 px-4 py-20 md:px-16">
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.items.map((f, i) => {
          const dark = i === last && data.items.length > 1;
          return (
            <article key={`${f.title}-${i}`} className={`${dark ? "glass-dark" : "glass"} flex min-h-[300px] flex-col justify-between p-9`}>
              <div className={`h-[52px] w-[52px] rounded-2xl bg-gradient-to-br ${dark ? "from-accent to-accent-soft" : tints[i % tints.length]}`} />
              <div>
                <h3 className={`mb-2.5 font-display text-2xl tracking-tight ${dark ? "text-white" : ""}`}>{f.title}</h3>
                <p className={`text-[15px] leading-relaxed ${dark ? "text-[#c6cce0]" : "text-muted"}`}>{f.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
