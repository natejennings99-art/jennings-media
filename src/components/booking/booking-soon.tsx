import Link from "next/link";
import { Camera, Clapperboard, MessageSquare, Phone, Plane } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { ShootRequestForm } from "@/components/booking/shoot-request-form";

const title = (slug?: string) => (slug ? slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "");

/**
 * Shown in production until the booking database is connected: a 30-second shoot request
 * (captured server-side) plus one-tap call/text, instead of a wizard that fails on its last step.
 */
export function BookingSoon({ email, pkg, service }: { email: string; pkg?: string; service?: string }) {
  const chosen = pkg ? `${title(pkg)} package` : service ? title(service) : "";
  const sms = BRAND.phoneHref.replace(/^tel:/, "sms:");
  return (
    <section className="gutter mx-auto max-w-3xl pt-36 pb-24 sm:pt-44">
      <p className="label text-accent-300">Real estate media · Tampa Bay</p>
      <h1 className="mt-6 font-display text-[clamp(2.75rem,8vw,6rem)] text-bone-50 [word-spacing:0.18em]">
        Book your
        <br />
        <span className="text-accent-300">shoot.</span>
      </h1>
      <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-mist-300">
        {chosen ? (
          <>
            You picked <span className="text-bone-50">{chosen}</span>.{" "}
          </>
        ) : null}
        Send the address and a time that works, and we&rsquo;ll text or call to confirm within one business day. Photography, cinematic video, drone, floor plans and 3D tours across Tampa Bay and the D.C. area.
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
      <div className="mt-14">
        <ShootRequestForm pkg={chosen || undefined} />
      </div>
      <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
        <p className="mr-2 text-[15px] text-mist-300">Rather talk?</p>
        <a href={BRAND.phoneHref} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-[14px] font-semibold text-bone-50 hover:border-accent-300">
          <Phone className="size-4" /> Call {BRAND.phone}
        </a>
        <a href={sms} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-[14px] font-semibold text-bone-50 hover:border-accent-300">
          <MessageSquare className="size-4" /> Text us
        </a>
        <Link href="/pricing" className="inline-flex h-12 items-center px-3 text-[14px] font-semibold text-mist-300 underline-offset-8 hover:text-bone-50 hover:underline">
          See pricing
        </Link>
      </div>
      <p className="mt-6 text-[13px] text-mist-500">
        Or email <a className="text-mist-300 underline underline-offset-4" href={`mailto:${email}`}>{email}</a>.
      </p>
    </section>
  );
}
