import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Booking Terms", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage title="Booking Terms" updated="September 29, 2026">
      <p>These terms apply to every project and booking with {BRAND.name}. <strong>Template language — have it reviewed by your attorney before launch.</strong></p>
      <h2>Bookings & pricing</h2>
      <p>Prices are based on the square footage you provide. If the property is materially larger than stated, we may adjust pricing to the correct size tier before delivery. Travel fees are calculated from the property address.</p>
      <h2>Rescheduling & cancellations</h2>
      <p>Reschedule or cancel free of charge up to 24 hours before your appointment. Later cancellations, or arriving to a property that isn&rsquo;t accessible or ready, may incur a trip fee.</p>
      <h2>Weather</h2>
      <p>Interior photography proceeds in most weather. Drone and twilight sessions may be rescheduled at no cost when conditions are unsafe or unsuitable.</p>
      <h2>Payment & delivery</h2>
      <p>Payment is due as selected at checkout. Media is released once the invoice is paid in full. Deposits reserve your appointment and are applied to your total.</p>
      <h2>Licensing</h2>
      <p>Upon payment you receive a license to use delivered media to market the property, including MLS, listing portals, print and social media, for the life of the listing. {BRAND.name} retains copyright and may use the work in its portfolio.</p>
      <h2>Liability</h2>
      <p>We take great care on site. Our liability for any claim is limited to the amount paid for the affected booking.</p>
    </LegalPage>
  );
}
