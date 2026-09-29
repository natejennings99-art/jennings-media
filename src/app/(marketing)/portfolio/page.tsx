import type { Metadata } from "next";
import Link from "next/link";
import { Camera } from "lucide-react";
import { getPortfolio } from "@/lib/data/public";
import { PageHero } from "@/components/marketing/page-hero";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";
import { FinalCta } from "@/components/marketing/final-cta";
import { Accent, EmptyState } from "@/components/ui/misc";
import { buttonStyles } from "@/components/ui/button";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Portfolio — Real Estate Photography, Video & Drone Work",
  description: "Browse recent listing photography, twilight shoots, cinematic video, drone aerials and commercial real estate media.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const projects = await getPortfolio();
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title={
          <>
            Recent <Accent>work.</Accent>
          </>
        }
        description="Photography, film, aerials and twilight — a selection of listings we've helped launch."
      />
      <section className="container-page pb-16">
        {projects.length ? (
          <PortfolioGrid projects={projects} />
        ) : (
          <EmptyState
            icon={<Camera className="size-5" />}
            title="New work is on the way"
            description="We're curating our latest listings. In the meantime, book a shoot and we'll make yours the next feature."
            action={
              <Link href="/book" className={buttonStyles()}>
                Book a Shoot
              </Link>
            }
          />
        )}
      </section>
      <FinalCta />
    </>
  );
}
