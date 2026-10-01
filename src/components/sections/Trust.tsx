import { assetUrl, type TrustData } from "@/lib/content";

export function Trust({ data }: { data: TrustData }) {
  if (data.logos.length === 0) return null;
  return (
    <section aria-label="Dipercaya pemilik booth" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row md:px-16">
      <p className="max-w-[220px] text-center text-sm leading-relaxed text-muted md:text-left">{data.caption}</p>
      <ul className="flex flex-wrap justify-center gap-x-12 gap-y-3 font-display text-[19px] text-[#9aa1b2]">
        {data.logos.map((l, i) => {
          const src = assetUrl(l.image);
          return (
            <li key={`${l.name}-${i}`} className="flex items-center">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded client logo of unknown size, served by the API
                <img src={src} alt={l.name} loading="lazy" className="h-9 w-auto max-w-[160px] object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
              ) : (
                l.name
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
