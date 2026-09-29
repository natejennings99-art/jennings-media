import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MobileCta } from "@/components/marketing/mobile-cta";
import { SmoothScroll } from "@/components/experience/smooth-scroll";
import { CustomCursor } from "@/components/experience/cursor";
import { TransitionProvider } from "@/components/experience/transition";
import { Intro } from "@/components/experience/intro";
import { INTRO_GATE } from "@/lib/intro";
import { getSettings } from "@/lib/data/public";
import { BRAND } from "@/lib/brand";

export default async function MarketingLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  const email = settings.email || BRAND.email || null;
  const socials = [
    { label: "Instagram", href: settings.social_links.instagram },
    { label: "LinkedIn", href: settings.social_links.linkedin },
    { label: "TikTok", href: settings.social_links.tiktok },
    { label: "YouTube", href: settings.social_links.youtube },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));
  return (
    <TransitionProvider>
      <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
      <Intro />
      <SmoothScroll />
      <CustomCursor />
      <div id="top" />
      <SiteHeader email={email} socials={socials} />
      <main id="main">{children}</main>
      <SiteFooter email={email} socials={socials} />
      <MobileCta />
    </TransitionProvider>
  );
}
