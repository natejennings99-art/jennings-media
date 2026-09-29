import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { Analytics } from "@/components/analytics/analytics";
import { getSettings } from "@/lib/data/public";
import { env } from "@/lib/env";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Jennings Media — Real Estate Photography, Video & Drone",
    template: "%s · Jennings Media",
  },
  description:
    "Premium real estate photography, cinematic video, drone, floor plans, 3D tours and listing marketing. Book online in minutes — photos delivered next morning.",
  applicationName: "Jennings Media",
  keywords: [
    "real estate photography",
    "real estate video",
    "drone photography",
    "Matterport 3D tours",
    "floor plans",
    "virtual twilight",
    "listing marketing",
  ],
  openGraph: {
    type: "website",
    siteName: "Jennings Media",
    locale: "en_US",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${geistMono.variable} ${instrument.variable} scroll-smooth antialiased`}
    >
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
