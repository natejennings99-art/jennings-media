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
    // 59 characters: brand first (other "Jennings Media" businesses exist), then the money service.
    default: `${BRAND.name} | Tampa Real Estate Photo, Video & Marketing`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  keywords: ["real estate photography Tampa", "real estate photographer Tampa", "listing video Tampa", "drone real estate photography Tampa", "marketing agency Tampa", "marketing agency Washington DC", "lead generation agency", "Meta ads agency", "Google Ads management", "AI agents for business", "social media agency", "real estate marketing", "video production DC"],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  category: "business",
  openGraph: { type: "website", siteName: BRAND.name, locale: "en_US" },
  twitter: { card: "summary_large_image", title: `${BRAND.name} | Tampa Real Estate Photo, Video & Marketing`, description: BRAND.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1, "max-snippet": -1 } },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } } : {}),
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
    <html lang="en" suppressHydrationWarning className={`${archivo.variable} ${geistMono.variable} antialiased`}>
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
