import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { assetUrl, getSite } from "@/lib/content";

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

export async function generateMetadata(): Promise<Metadata> {
  // Favicon is editable from the CMS (Pengaturan umum); without one the browser default / app icon route applies.
  const favicon = assetUrl((await getSite()).faviconUrl);
  return {
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: "./" },
    title: { default: "STUDIODO — Platform Photobooth untuk Pemilik Booth", template: "%s — STUDIODO" },
    description,
    ...(favicon ? { icons: { icon: favicon, apple: favicon } } : {}),
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: SITE_NAME,
      title: "STUDIODO — Platform Photobooth untuk Pemilik Booth",
      description,
    },
    twitter: { card: "summary_large_image", title: "STUDIODO — Platform Photobooth", description },
  };
}

// Runs before first paint so a dark-mode visitor never sees a flash of the light theme.
// Mirrors ThemeToggle: a stored "light"/"dark" wins, otherwise follow the OS preference.
const THEME_INIT = `(function(){try{var m=localStorage.getItem('studiodo-theme');var d=m==='dark'||(m!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: THEME_INIT sets data-theme on <html> before React hydrates.
    <html lang="id" className={`${jakarta.variable} ${sora.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <a href="#konten" className="sr-only rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-on-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">
          Lewati ke konten
        </a>
        {children}
      </body>
    </html>
  );
}
