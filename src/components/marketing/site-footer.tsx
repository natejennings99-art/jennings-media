import Link from "next/link";
import { ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "@/components/ui/brand-icons";
import { getCatalog, getServiceAreas, getSettings } from "@/lib/data/public";
import { NAV_LINKS } from "@/lib/content/site";
import { Logo } from "@/components/ui/misc";
import { buttonStyles } from "@/components/ui/button";
import { formatPhone } from "@/lib/utils";

export async function SiteFooter() {
  const [settings, catalog, areas] = await Promise.all([getSettings(), getCatalog(), getServiceAreas()]);
  const services = catalog.services.filter((s) => s.is_featured).slice(0, 7);
  const markets = [...new Set(areas.map((a) => a.market ?? a.name))];
  const social = [
    { href: settings.social_links.instagram, icon: InstagramIcon, label: "Instagram" },
    { href: settings.social_links.facebook, icon: FacebookIcon, label: "Facebook" },
    { href: settings.social_links.youtube, icon: YoutubeIcon, label: "YouTube" },
    { href: settings.social_links.linkedin, icon: LinkedinIcon, label: "LinkedIn" },
  ].filter((s) => s.href);

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-ink-950 pt-20 pb-28 md:pb-12">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-gold-400/[0.06] blur-3xl" />
      <div className="container-page relative">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-mist-400">
              Premium photography, cinematic video, drone, floor plans, 3D tours and listing marketing for real estate professionals.
            </p>
            <Link href="/book" className={buttonStyles({ className: "mt-7" })}>
              Book a Shoot
              <ArrowUpRight className="size-4" />
            </Link>
            {social.length > 0 && (
              <div className="mt-8 flex gap-2">
                {social.map(({ href, icon: Icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full border border-white/10 text-mist-300 transition hover:border-white/25 hover:text-bone-50">
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="eyebrow mb-5">Services</p>
              <ul className="space-y-3 text-[14.5px]">
                {services.map((s) => (
                  <li key={s.id}>
                    <Link href={`/services/${s.slug}`} className="text-mist-300 transition hover:text-bone-50">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-5">Company</p>
              <ul className="space-y-3 text-[14.5px]">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-mist-300 transition hover:text-bone-50">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/login" className="text-mist-300 transition hover:text-bone-50">
                    Client login
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="eyebrow mb-5">Contact</p>
              <ul className="space-y-3 text-[14.5px] text-mist-300">
                {settings.email && (
                  <li className="flex items-center gap-2.5">
                    <Mail className="size-4 text-mist-500" />
                    <a href={`mailto:${settings.email}`} className="transition hover:text-bone-50">
                      {settings.email}
                    </a>
                  </li>
                )}
                {settings.phone && (
                  <li className="flex items-center gap-2.5">
                    <Phone className="size-4 text-mist-500" />
                    <a href={`tel:${settings.phone}`} className="transition hover:text-bone-50">
                      {formatPhone(settings.phone)}
                    </a>
                  </li>
                )}
                {markets.length > 0 && (
                  <li className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 size-4 text-mist-500" />
                    <span>Serving {markets.join(", ")}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div aria-hidden className="pointer-events-none mt-20 select-none text-center text-[clamp(3.5rem,15vw,15rem)] leading-[0.8] font-semibold tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.09)]">
          Jennings Media
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/[0.07] pt-8 text-[13px] text-mist-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {settings.legal_name || settings.business_name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition hover:text-bone-50">Privacy</Link>
            <Link href="/terms" className="transition hover:text-bone-50">Terms</Link>
            <Link href="/sitemap.xml" className="transition hover:text-bone-50">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
