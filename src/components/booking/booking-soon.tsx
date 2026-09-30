import Link from "next/link";
import { ArrowUpRight, Camera, Clapperboard, Plane, Mail } from "lucide-react";
import { BRAND } from "@/lib/brand";

const SUBJECT = encodeURIComponent("Shoot request — Jennings Media");
const BODY = encodeURIComponent("Hi Jennings Media,\n\nI'd like to book a shoot.\n\nProperty address:\nPreferred date/time:\nServices (photos, video, drone, floor plan, 3D tour):\nMy name and phone:\n\nThanks!");

/** Shown in production until the booking database is connected — instead of a wizard that fails on its last step. */
export function BookingSoon({ email }: { email: string }) {
  return (
    <section className="gutter mx-auto max-w-3xl pt-36 pb-24 sm:pt-44">
      <p className="label text-accent-300">Real estate media</p>
      <h1 className="mt-6 font-display text-[clamp(2.75rem,8vw,6rem)] text-bone-50">
        Online booking
        <br />
        opens <span className="text-accent-300">soon.</span>
      </h1>
      <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-mist-300">
        Photography, cinematic video, drone, floor plans and 3D tours across Washington, D.C., Northern Virginia, Maryland and Tampa Bay. Send us the address and a few dates — we&rsquo;ll confirm your shoot within one business day.
      </p>
      <ul className="mt-10 grid gap-3 text-[15px] text-mist-300 sm:grid-cols-3">
        {[
          [Camera, "HDR photography"],
          [Clapperboard, "Cinematic video & reels"],
          [Plane, "Drone & aerial"],
        ].map(([Icon, label]) => {
          const I = Icon as typeof Camera;
          return (
            <li key={label as string} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.02] px-4 py-3">
              <I className="size-4 text-accent-300" />
              {label as string}
            </li>
          );
        })}
      </ul>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <a
          href={`mailto:${email}?subject=${SUBJECT}&body=${BODY}`}
          data-cursor="cta"
          className="group inline-flex h-14 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50"
        >
          <Mail className="size-4" /> Email your request
          <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="size-4" />
          </span>
        </a>
        <Link href="/pricing" className="inline-flex h-14 items-center px-4 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase underline-offset-8 hover:underline">
          See pricing
        </Link>
        <Link href="/contact" className="inline-flex h-14 items-center px-4 text-[14px] font-semibold tracking-[0.04em] text-mist-300 uppercase underline-offset-8 hover:text-bone-50 hover:underline">
          Contact form
        </Link>
      </div>
      <p className="mt-8 text-[13px] text-mist-500">
        Prefer to talk? Email <a className="text-mist-300 underline underline-offset-4" href={`mailto:${email}`}>{email}</a> — {BRAND.name}.
      </p>
    </section>
  );
}
