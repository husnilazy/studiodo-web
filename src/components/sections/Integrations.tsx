import { SectionHeading } from "../SectionHeading";
import { assetUrl, type IntegrationsData } from "@/lib/content";

// "Terintegrasi dengan": the cameras, payment gateways and printers STUDIODO works with. A name is shown as a wordmark badge; when the
// admin uploads a logo (Superadmin -> Konten Website) the logo is shown instead. Nothing here claims an official partnership: the footnote
// says so, and it can only be changed in the CMS by whoever has the agreement to back a stronger claim.

const GROUPS: { key: string; title: string; hint: string }[] = [
  { key: "kamera", title: "Kamera", hint: "Kontrol penuh dari dashboard" },
  { key: "pembayaran", title: "Pembayaran", hint: "Masuk otomatis, sesi langsung jalan" },
  { key: "cetak", title: "Cetak", hint: "Pakai printer yang sudah ada" },
];

function Badge({ name, image }: { name: string; image?: string }) {
  const src = assetUrl(image);
  return (
    <span className="inline-flex h-10 min-w-[84px] shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-foreground/10 bg-white px-3.5 text-[#0b1020] shadow-sm">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded logo of unknown size, served by the API
        <img src={src} alt={name} className="h-5 w-auto max-w-[110px] object-contain" />
      ) : (
        <span className="font-display text-[15px] font-semibold tracking-tight">{name}</span>
      )}
    </span>
  );
}

/** An illustration of the camera panel in the dashboard (the values are an example, not live data). */
function CameraPanel() {
  const rows: [string, string][] = [["ISO", "800"], ["Aperture", "f/5.6"], ["Shutter", "1/125"], ["White balance", "Kelvin 5600K"], ["Exposure comp.", "-0.3"]];
  return (
    <div data-reveal="up" data-delay="120" className="glass flex flex-col gap-4 p-6 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[12px] text-muted">Contoh tampilan di dashboard</div>
          <div className="font-display text-xl tracking-tight">Canon EOS</div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dff7ec] px-3 py-1 text-[12px] font-semibold text-[#0f6b45]"><span className="h-1.5 w-1.5 rounded-full bg-[#22c58b]" />Terhubung</span>
      </div>
      <dl className="grid gap-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between rounded-xl bg-foreground/[0.04] px-4 py-2.5">
            <dt className="text-[13.5px] text-muted">{k}</dt>
            <dd className="font-display text-[15px] font-semibold tracking-tight">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[12.5px] leading-relaxed text-muted">Pengaturan disimpan sebagai preset booth dan dipasang lagi otomatis setiap kamera menyala, tanpa datang ke lokasi.</p>
    </div>
  );
}

export function Integrations({ data }: { data: IntegrationsData }) {
  const items = (data.items ?? []).filter((i) => i.name?.trim());
  if (items.length === 0) return null;
  return (
    <section id="integrasi" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-12 px-4 py-16 md:px-16">
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      {data.subtitle && <p data-reveal="up" className="mx-auto -mt-6 max-w-[680px] text-center text-[17px] leading-relaxed text-muted">{data.subtitle}</p>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="grid gap-5">
          {GROUPS.map((g, gi) => {
            const list = items.filter((i) => (i.group || "kamera") === g.key);
            if (list.length === 0) return null;
            return (
              <article key={g.key} data-reveal="up" data-delay={String(gi * 90)} className="glass p-6 md:p-7">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl tracking-tight">{g.title}</h3>
                  <span className="text-[12.5px] text-muted">{g.hint}</span>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {list.map((i) => (
                    <li key={`${i.name}-${i.note}`} className="flex items-start gap-3">
                      <Badge name={i.name} image={i.image} />
                      {i.note && <span className="pt-1 text-[13px] leading-snug text-muted">{i.note}</span>}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        <CameraPanel />
      </div>
      {data.footnote && <p data-reveal="up" className="mx-auto max-w-[760px] text-center text-[12.5px] leading-relaxed text-muted">{data.footnote}</p>}
    </section>
  );
}
