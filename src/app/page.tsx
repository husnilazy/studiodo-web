import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { Trust } from "@/components/sections/Trust";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Templates } from "@/components/sections/Templates";
import { Pricing } from "@/components/sections/Pricing";
import { Community } from "@/components/sections/Community";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { Cta } from "@/components/sections/Cta";
import { getSiteContent, type SiteData } from "@/lib/content";

// Section registry: the CMS decides which of these render and in what order;
// each renderer just receives that section's data. An unknown key (e.g. a section
// added on the server before the web is redeployed) is skipped, never a crash.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Renderer = (data: any, site: SiteData) => ReactNode;
const registry: Record<string, Renderer> = {
  hero: (d) => <Hero data={d} />,
  trust: (d) => <Trust data={d} />,
  features: (d) => <Features data={d} />,
  howItWorks: (d) => <HowItWorks data={d} />,
  templates: (d) => <Templates data={d} />,
  pricing: (d) => <Pricing data={d} />,
  community: (d) => <Community data={d} />,
  testimonials: (d) => <Testimonials data={d} />,
  faq: (d) => <Faq data={d} />,
  cta: (d, site) => <Cta data={d} site={site} />,
};

export default async function Home() {
  const { site, sections } = await getSiteContent();
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="blob left-[55%] -top-20 h-[620px] w-[620px] bg-[#bfc6ff] opacity-75" />
      <div className="blob left-[75%] top-[300px] h-[420px] w-[420px] bg-[#ffc8de] opacity-70" />
      <div className="blob -left-40 top-[1150px] h-[520px] w-[520px] bg-[#b8f0e6] opacity-60" />
      <div className="blob left-[70%] top-[2000px] h-[560px] w-[560px] bg-[#d5ccff] opacity-60" />
      <div className="blob -left-32 top-[2900px] h-[500px] w-[500px] bg-[#ffe3b8] opacity-60" />
      <div className="blob left-[62%] top-[3900px] h-[560px] w-[560px] bg-[#bfd8ff] opacity-65" />
      <div className="blob -left-24 top-[4800px] h-[520px] w-[520px] bg-[#ffc8de] opacity-55" />
      <div className="blob left-[48%] top-[5600px] h-[640px] w-[640px] bg-[#bfc6ff] opacity-70" />
      <Navbar />
      <main id="konten" className="flex-1">
        {sections.map((s) => {
          const render = registry[s.key];
          return render ? <div key={s.key}>{render(s.data, site)}</div> : null;
        })}
      </main>
      <Footer />
    </div>
  );
}
