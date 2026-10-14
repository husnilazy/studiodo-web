import type { Metadata } from "next";
import Link from "next/link";
import { InvoiceSheet } from "@/components/invoice/InvoiceSheet";
import { InvoiceActions } from "@/components/invoice/InvoiceActions";
import { loadInvoice } from "@/lib/invoice";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Invoice", robots: { index: false, follow: false } };

// Invoice page. Opens with the signed link from the invoice email (?t=…, no login needed) or, from the dashboard,
// with the tenant's own session. Sits outside the dashboard layout so printing it gives just the document.
export default async function InvoicePage({ params, searchParams }: { params: Promise<{ orderId: string }>; searchParams: Promise<{ t?: string }> }) {
  const [{ orderId }, { t }] = await Promise.all([params, searchParams]);
  const result = await loadInvoice(orderId, t);

  if (!result) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-clip px-4 py-16">
        <div className="glass relative z-10 max-w-[460px] p-9 text-center">
          <h1 className="font-display text-[26px] tracking-tight">Invoice tidak ditemukan</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">Tautannya mungkin salah atau sudah tidak berlaku. Buka invoice dari email yang kami kirim, atau masuk ke dashboard untuk melihat semua tagihan Anda.</p>
          <Link href="/portal/tagihan" className="btn btn-primary mt-6 inline-block px-7 py-3.5 text-[15px]">Buka dashboard</Link>
        </div>
      </main>
    );
  }

  const { invoice, shareUrl, signedIn } = result;
  return (
    <main className="relative min-h-screen overflow-clip px-4 py-10 print:min-h-0 print:p-0 sm:py-14">
      <div aria-hidden="true" className="blob -left-24 top-10 h-[420px] w-[420px] bg-[#bfc6ff] opacity-70 print:hidden" />
      <div aria-hidden="true" className="blob -right-24 top-[420px] h-[380px] w-[380px] bg-[#ffc8de] opacity-60 print:hidden" />
      <div className="relative z-10 flex flex-col gap-7 print:block">
        <InvoiceSheet invoice={invoice} />
        <InvoiceActions orderId={invoice.invoiceNumber} status={invoice.status} payUrl={invoice.payUrl} shareUrl={shareUrl} signedIn={signedIn} />
      </div>
    </main>
  );
}
