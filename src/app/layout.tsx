import type { Metadata, Viewport } from "next";
import { Archivo, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { Analytics } from "@/components/analytics/analytics";
import { getSettings } from "@/lib/data/public";
import { env } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${BRAND.name} — ${BRAND.descriptor}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  keywords: ["creative agency", "marketing agency", "paid media", "brand strategy", "social media agency", "content production", "web design", "growth marketing"],
  openGraph: { type: "website", siteName: BRAND.name, locale: "en_US", url: "/" },
  twitter: { card: "summary_large_image", title: `${BRAND.name} — ${BRAND.descriptor}`, description: BRAND.description },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <html lang="en" className={`${archivo.variable} ${geistMono.variable} antialiased`}>
      <body className="grain min-h-dvh overflow-x-clip">
        <ToastProvider>{children}</ToastProvider>
        <Analytics
          gaId={env.gaId || settings.analytics.ga4_id}
          adsId={env.googleAdsId || settings.analytics.google_ads_id}
          pixelId={env.metaPixelId || settings.analytics.meta_pixel_id}
        />
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
