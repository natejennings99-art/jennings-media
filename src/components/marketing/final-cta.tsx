import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { Accent } from "@/components/ui/misc";
import { IMAGES } from "@/lib/content/images";
import { Reveal } from "@/components/motion/reveal";

export function FinalCta({
  title = (
    <>
      Ready to Make Your Next Listing <Accent>Stand Out?</Accent>
    </>
  ),
  image = IMAGES.villaTwilight,
}: {
  title?: React.ReactNode;
  image?: string;
}) {
  return (
    <section className="container-page py-24 sm:py-32">
      <Reveal variant="scale">
        <div className="relative isolate overflow-hidden rounded-[36px] border border-white/10 px-6 py-20 text-center sm:px-12 sm:py-28">
          <Image src={image} alt="" fill sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-ink-950/70" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgb(216_177_116/0.25),transparent_60%)]" />
          <h2 className="mx-auto max-w-4xl text-balance text-4xl leading-[1.02] font-medium tracking-[-0.05em] text-bone-50 sm:text-6xl lg:text-7xl">
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-mist-300 sm:text-lg">
            Book online in two minutes. We&rsquo;ll handle the light, the lens and the deadline.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/book" className={buttonStyles({ size: "xl", className: "w-full sm:w-auto" })}>
              Book a Shoot
              <ArrowRight className="size-5 transition-transform group-hover/btn:translate-x-1" />
            </Link>
            <Link href="/contact" className={buttonStyles({ variant: "secondary", size: "xl", className: "w-full sm:w-auto" })}>
              Talk to our team
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
