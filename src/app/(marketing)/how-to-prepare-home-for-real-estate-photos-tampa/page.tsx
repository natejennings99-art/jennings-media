import type { Metadata } from "next";
import { Square } from "lucide-react";
import { getCatalog } from "@/lib/data/public";
import { formatMoney } from "@/lib/utils";
import { FAQS } from "@/lib/content/site";
import { REQUEST_RESCHEDULE_ANSWER, bookingRequestMode } from "@/lib/content/real-estate";
import { SectionLabel } from "@/components/agency/section-label";
import { PageIntro } from "@/components/agency/page-intro";
import { FinalCta } from "@/components/agency/final-cta";
import { RE_BOOK_CTA } from "@/lib/content/real-estate-cta";
import { TransitionLink } from "@/components/experience/transition";
import { BookCtaRow } from "@/components/marketing/book-cta-row";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";

export const revalidate = 300;

const PATH = "/how-to-prepare-home-for-real-estate-photos-tampa";

// "Prepare Your Home for Real Estate Photos" + " | Jennings Media" = 57 characters.
const TITLE = "Prepare Your Home for Real Estate Photos";
const DESCRIPTION = "A simple Tampa Bay checklist to get a home ready for real estate photos: lights, blinds, counters, cars, pool, lanai and pets. Plus timing and rain plans.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, images: [{ url: "/media/photos/twilight-deck.jpg" }] },
};

const BASICS = [
  ["Every light on", "Lamps, ceiling lights, under-cabinet lights. Bright rooms look bigger."],
  ["Blinds open", "Let the daylight in."],
  ["Counters and tables clear", "Less stuff means the eye goes to the space, not the clutter."],
  ["Personal items away", "Family photos, mail, medicine, toiletries. Buyers want to picture their own life there."],
] as const;

const ROOMS = [
  ["Kitchen", "Clear the counters as much as you can. Put away dish racks, sponges, paper towels and small appliances you don't need out. Take magnets and papers off the fridge. Close cabinet doors."],
  ["Living areas", "Straighten pillows and throws. Pick up toys, remotes and chargers. Tuck away loose cords where you can."],
  ["Bedrooms", "Make the beds. Clear the nightstands down to a lamp or two. Put clothes and shoes out of sight, and close closet doors."],
  ["Bathrooms", "Clear the counters and the tub ledge. Put the toilet lid down. Hang clean towels neatly, or remove them."],
] as const;

const OUTSIDE = [
  "Move cars out of the driveway, and off the street in front of the house if you can.",
  "Close the garage door.",
  "Tidy the yard: put away hoses, toys and trash bins.",
  "Clean off the patio and set outdoor furniture neatly.",
];

const FLORIDA = ["Make sure the pool is clean.", "Clear leaves and debris from the pool cage and the lanai.", "Open the sliders so the inside and outside feel connected."];

const CHECKLIST = [
  "Every light on (lamps and ceiling lights)",
  "Blinds open",
  "Kitchen counters and tables cleared",
  "Fridge front cleared",
  "Beds made, nightstands cleared",
  "Bathroom counters cleared, toilet lids down",
  "Personal items and photos put away",
  "Cars out of the driveway",
  "Garage door closed",
  "Yard and patio tidy, bins out of sight",
  "Pool clean, pool cage and lanai free of debris",
  "Sliders open",
  "Pets secured",
  "Lockbox or access instructions shared",
];

const weatherAnswer = FAQS.find((f) => /weather/i.test(f.q))!.a;
const arriveAnswer = FAQS.find((f) => /need to be there/i.test(f.q))!.a;
const rescheduleAnswer = FAQS.find((f) => /reschedule/i.test(f.q))!.a;

export default async function PrepareHomeForPhotosPage() {
  const catalog = await getCatalog();
  const requestMode = bookingRequestMode();
  const svc = (slug: string) => catalog.services.find((s) => s.slug === slug && s.is_bookable);
  const addOn = (slug: string) => catalog.addOns.find((a) => a.slug === slug && a.is_active);
  const photo = svc("photography");
  const drone = svc("drone-photography");
  const plan = svc("floor-plans");
  const rush = addOn("rush-delivery");
  const keys = addOn("key-pickup");
  const delivery = photo?.features.find((f) => /delivered/i.test(f));

  const access = requestMode
    ? "You don't need to be home. Send lockbox or access instructions with your request, or when we confirm. We text when we arrive and again when we leave."
    : arriveAnswer.replace(/^No\. /, "You don't need to be home. ");
  const timing = [
    photo?.duration_minutes && `Photography is about ${photo.duration_minutes} minutes on site.`,
    drone?.duration_minutes && `Drone photos add about ${drone.duration_minutes} minutes.`,
    plan?.duration_minutes && `A floor plan adds about ${plan.duration_minutes} minutes.`,
  ].filter(Boolean) as string[];
  const deliveryText = [
    delivery && `${delivery.replace(/^Delivered/, "Photos are delivered")}.`,
    rush?.description && `Need them the same day? ${rush.name} (${formatMoney(rush.price_cents)}): ${rush.description.charAt(0).toLowerCase()}${rush.description.slice(1)}`,
  ].filter(Boolean) as string[];

  const faq = [
    { q: "Do I need to be home for the photos?", a: access.replace(/^You don't need to be home\. /, "No. ") },
    { q: "How long does a real estate photo shoot take?", a: timing.length ? `${timing.join(" ")} Bigger homes or extra services can take longer.` : "It depends on the size of the home and what you book." },
    { q: "What happens if it rains on shoot day?", a: weatherAnswer },
    ...(deliveryText.length ? [{ q: "When will I get my photos?", a: deliveryText.join(" ") }] : []),
    { q: "Can I reschedule if the house isn't ready?", a: requestMode ? REQUEST_RESCHEDULE_ANSWER : rescheduleAnswer.replace(/ from your dashboard or by replying to your confirmation email/, "") },
  ];

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to prepare a home for real estate photos",
    step: CHECKLIST.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
  };

  const link = "text-bone-50 underline underline-offset-4 hover:text-accent-300";
  const h2 = "max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50";
  const li = "text-[16px] leading-relaxed text-mist-300";

  return (
    <>
      <JsonLd
        data={[
          howToLd,
          faqSchema(faq),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Real estate", path: "/real-estate" },
            { name: "Photo prep checklist", path: PATH },
          ]),
        ]}
      />

      <PageIntro
        label="Prep checklist · Tampa Bay"
        title={
          <>
            How to get your home ready for <span className="text-accent-300">photos.</span>
          </>
        }
        aside={<BookCtaRow />}
      >
        Turn on every light, open the blinds, clear the countertops, put personal items away and move the cars out of the driveway. In Tampa Bay, also make sure the pool is clean, the
        pool cage is free of debris and the sliders are open. That covers most of what makes a listing look bright and roomy. The rest of this page walks through it room by room.
      </PageIntro>

      {/* ───────────── Shoot day ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="day-title">
        <SectionLabel index="01" className="mb-8">Shoot day</SectionLabel>
        <h2 id="day-title" className={h2}>
          What the shoot day <span className="text-accent-300">looks like.</span>
        </h2>
        <div className="mt-8 max-w-[68ch] space-y-5 text-[17px] leading-relaxed text-mist-300">
          <p>
            {access}
            {keys && ` If keys are at your office, our ${keys.name} add-on (${formatMoney(keys.price_cents)}) means we collect them and bring them back.`}
          </p>
          {timing.length > 0 && <p>{timing.join(" ")} Bigger homes or extra services can take longer.</p>}
          {deliveryText.length > 0 && <p>{deliveryText.join(" ")}</p>}
        </div>
      </section>

      {/* ───────────── Basics ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="basics-title">
        <SectionLabel index="02" className="mb-8">Whole-house basics</SectionLabel>
        <h2 id="basics-title" className={h2}>
          Four steps that matter <span className="text-accent-300">in every room.</span>
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {BASICS.map(([t, d]) => (
            <div key={t} className="bg-ink-950 p-7 sm:p-8">
              <h3 className="text-[22px] font-semibold tracking-tight text-bone-50">{t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mist-400">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── Room by room ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="rooms-title">
        <SectionLabel index="03" className="mb-8">Room by room</SectionLabel>
        <h2 id="rooms-title" className={h2}>
          Inside, <span className="text-accent-300">room by room.</span>
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {ROOMS.map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-white/10 p-7">
              <h3 className="text-[22px] font-semibold tracking-tight text-bone-50">{t}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-mist-300">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── Outside & Florida ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="outside-title">
        <SectionLabel index="04" className="mb-8">Outside</SectionLabel>
        <h2 id="outside-title" className={h2}>
          The curb, the yard <span className="text-accent-300">and the lanai.</span>
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-[22px] font-semibold tracking-tight text-bone-50">Front and yard</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              {OUTSIDE.map((t) => (
                <li key={t} className={li}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[22px] font-semibold tracking-tight text-bone-50">Florida extras</h3>
            <p className="mt-4 text-[16px] leading-relaxed text-mist-300">A screened lanai or a pool with clear water can tell a buyer more than another bedroom angle. Before the shoot:</p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              {FLORIDA.map((t) => (
                <li key={t} className={li}>{t}</li>
              ))}
            </ul>
            <p className="mt-4 text-[16px] leading-relaxed text-mist-300">
              Read more in our <TransitionLink href="/insights/tampa-listing-media-guide" className={link}>Tampa Bay listing media guide</TransitionLink>.
            </p>
          </div>
        </div>
        <div className="mt-12 max-w-[68ch]">
          <h3 className="text-[22px] font-semibold tracking-tight text-bone-50">Pets</h3>
          <p className="mt-3 text-[16px] leading-relaxed text-mist-300">
            Please secure pets during the shoot. A crate, a closed room we don&rsquo;t need to photograph, or a walk with a neighbor all work. Put away pet bowls, beds and litter boxes too.
          </p>
        </div>
        <div className="mt-12 max-w-[68ch]">
          <h3 className="text-[22px] font-semibold tracking-tight text-bone-50">What if it rains?</h3>
          <p className="mt-3 text-[16px] leading-relaxed text-mist-300">{weatherAnswer}</p>
        </div>
      </section>

      {/* ───────────── Checklist ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="checklist-title">
        <SectionLabel index="05" className="mb-8">The checklist</SectionLabel>
        <h2 id="checklist-title" className={h2}>
          Print it, <span className="text-accent-300">tick it off.</span>
        </h2>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {CHECKLIST.map((t) => (
            <li key={t} className="flex gap-3 rounded-xl border border-white/10 px-5 py-4 text-[15px] leading-snug text-bone-100">
              <Square className="mt-0.5 size-4 shrink-0 text-accent-300" aria-hidden /> {t}
            </li>
          ))}
        </ul>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="faq-title">
        <SectionLabel index="06" className="mb-8">Questions</SectionLabel>
        <h2 id="faq-title" className="font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">Prep FAQ</h2>
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {faq.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[19px] font-semibold tracking-tight text-bone-50 marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 text-accent-300 transition-transform duration-500 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-mist-300">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 max-w-[68ch] text-[16px] leading-relaxed text-mist-300">
          Want to know the cost first? See <TransitionLink href="/real-estate-photography-cost-tampa" className={link}>what real estate photography costs in Tampa</TransitionLink>.
        </p>
      </section>

      <FinalCta title="House ready?" kicker="Book your shoot." {...RE_BOOK_CTA} />
    </>
  );
}
