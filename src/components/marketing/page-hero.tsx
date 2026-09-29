import Image from "next/image";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/misc";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-24">
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-45" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/60 via-ink-950/75 to-ink-950" />
        </>
      )}
      {!image && <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[64rem] -translate-x-1/2 rounded-full bg-accent-400/[0.07] blur-3xl" />}
      <div className="container-page">
        <Eyebrow className="mb-6 animate-fade-up">{eyebrow}</Eyebrow>
        <h1 className="max-w-5xl animate-fade-up text-balance text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] font-medium tracking-[-0.055em] text-bone-50 [animation-delay:100ms]">
          {title}
        </h1>
        {description && (
          <p className="mt-7 max-w-2xl animate-fade-up text-pretty text-base leading-relaxed text-mist-300 [animation-delay:220ms] sm:text-lg">
            {description}
          </p>
        )}
        {children && <div className="mt-9 animate-fade-up [animation-delay:320ms]">{children}</div>}
      </div>
    </section>
  );
}
