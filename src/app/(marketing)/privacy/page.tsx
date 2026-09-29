import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 29, 2026">
      <p>This policy explains what information {BRAND.name} collects, how we use it and the choices you have. <strong>Have this reviewed by your attorney before launch.</strong></p>
      <h2>Information we collect</h2>
      <p>Contact details you provide (name, email, phone, company, brokerage), property details and access instructions for booked shoots, billing information processed by Stripe (we never see or store full card numbers), and basic usage analytics.</p>
      <h2>How we use it</h2>
      <p>To schedule and deliver services, send booking and delivery notifications, process payments, provide support and improve our services. We send marketing emails only if you opt in, and you can unsubscribe at any time.</p>
      <h2>Sharing</h2>
      <p>We share information only with service providers that help us operate — hosting and database (Supabase, Vercel), payments (Stripe), email (Resend) and, if enabled, SMS (Twilio) — and when required by law. We never sell personal information.</p>
      <h2>Media</h2>
      <p>Property media is stored privately and shared only through your dashboard and the links you choose to share. We may feature select work in our portfolio unless you ask us not to.</p>
      <h2>Your choices</h2>
      <p>You can access and update your profile in your dashboard, and request deletion of your account and data by contacting us.</p>
      <h2>Contact</h2>
      <p>Questions about privacy? Reach us through the contact page.</p>
    </LegalPage>
  );
}
