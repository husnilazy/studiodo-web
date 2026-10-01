import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Ajukan akun tenant STUDIODO dan coba semua fitur gratis 7 hari.",
};

export default async function DaftarPage({ searchParams }: PageProps<"/daftar">) {
  const sp = await searchParams;
  const plan = typeof sp.paket === "string" ? sp.paket.slice(0, 60) : undefined;

  return (
    <div className="relative flex flex-1 flex-col overflow-clip">
      <div className="blob left-[55%] -top-20 h-[560px] w-[560px] bg-[#bfc6ff] opacity-75" />
      <div className="blob -left-32 top-[500px] h-[460px] w-[460px] bg-[#ffc8de] opacity-60" />
      <Navbar />
      <main id="konten" className="relative z-10 mx-auto w-full max-w-[720px] flex-1 px-4 pb-10 pt-14 md:pt-20">
        <div className="mb-10 flex flex-col gap-4">
          <div className="eyebrow">Daftar</div>
          <h1 className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">
            Mulai trial gratis 7 hari.
          </h1>
          <p className="text-[17px] leading-relaxed text-muted">
            Isi data singkat berikut. Tim kami meninjau pengajuan lalu mengaktifkan akun tenant Anda.
          </p>
        </div>
        <SignupForm plan={plan} />
      </main>
      <Footer />
    </div>
  );
}
