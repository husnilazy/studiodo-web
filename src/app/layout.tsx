import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const description =
  "Software kiosk photobooth dengan QRIS otomatis, template kreator, galeri cloud, dan dashboard real-time.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "STUDIODO — Platform Photobooth untuk Pemilik Booth", template: "%s — STUDIODO" },
  description,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    title: "STUDIODO — Platform Photobooth untuk Pemilik Booth",
    description,
  },
  twitter: { card: "summary_large_image", title: "STUDIODO — Platform Photobooth", description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} ${sora.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <a href="#konten" className="sr-only rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">
          Lewati ke konten
        </a>
        {children}
      </body>
    </html>
  );
}
