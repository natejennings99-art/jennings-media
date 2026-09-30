import { ArrowUpRight } from "lucide-react";
import { HOME_PHOTOS } from "@/lib/content/photos";
import { PhotoGallery } from "./photo-gallery";
import { SectionLabel } from "./section-label";
import { SplitReveal } from "@/components/experience/split-reveal";
import { TransitionLink } from "@/components/experience/transition";

/** Homepage photography section — real stills from our shoots, not stock. */
export function PhotoWall() {
  return (
    <section className="gutter py-24 sm:py-36" aria-labelledby="photo-title">
      <div className="mb-14 grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <SectionLabel index="05" className="mb-8">Photography</SectionLabel>
          <SplitReveal as="h2" id="photo-title" className="font-display text-section text-bone-50">
            Every frame,
            <br />
            <span className="text-accent-300">shot by us.</span>
          </SplitReveal>
        </div>
        <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
          {[
            ["/real-estate#photos", "Real estate photography"],
            ["/events", "Event photography"],
          ].map(([href, label]) => (
            <TransitionLink key={href} href={href} className="group inline-flex items-center gap-2 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase hover:text-accent-300">
              <span className="border-b border-current pb-1">{label}</span>
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
            </TransitionLink>
          ))}
        </div>
      </div>
      <PhotoGallery photos={HOME_PHOTOS} columns={4} />
    </section>
  );
}
