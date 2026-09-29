import type { PaymentOption } from "@/lib/types";
import type { DiscountSpec } from "@/lib/pricing/engine";

export interface DraftProperty {
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  property_type: string;
  square_feet: string;
  bedrooms: string;
  bathrooms: string;
  listing_status: string;
  occupancy: "occupied" | "vacant";
  access_instructions: string;
  special_instructions: string;
  mls_number: string;
  preferred_date: string;
  arrival_window: string;
}

export interface DraftCustomer {
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  brokerage: string;
  billing_same_as_property: boolean;
  billing_line1: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  marketing_opt_in: boolean;
  sms_opt_in: boolean;
}

export interface DraftSlot {
  start: string;
  end: string;
  label: string;
  date: string;
  kind: "standard" | "twilight";
}

export interface BookingDraft {
  v: 2;
  step: number;
  property: DraftProperty;
  serviceIds: string[];
  serviceQuantities: Record<string, number>;
  packageId: string | null;
  addOns: Record<string, number>;
  slot: DraftSlot | null;
  requestWithoutSlot: boolean;
  customer: DraftCustomer;
  paymentOption: PaymentOption;
  promoCode: string;
  discount: DiscountSpec | null;
  acceptTerms: boolean;
}

export const STEPS = [
  { key: "property", label: "Property" },
  { key: "services", label: "Services" },
  { key: "package", label: "Package" },
  { key: "addons", label: "Add-ons" },
  { key: "schedule", label: "Schedule" },
  { key: "details", label: "Your details" },
  { key: "payment", label: "Payment" },
] as const;

export function emptyDraft(): BookingDraft {
  return {
    v: 2,
    step: 0,
    property: {
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      property_type: "single_family",
      square_feet: "",
      bedrooms: "",
      bathrooms: "",
      listing_status: "coming_soon",
      occupancy: "occupied",
      access_instructions: "",
      special_instructions: "",
      mls_number: "",
      preferred_date: "",
      arrival_window: "flexible",
    },
    serviceIds: [],
    serviceQuantities: {},
    packageId: null,
    addOns: {},
    slot: null,
    requestWithoutSlot: false,
    customer: {
      first_name: "",
      last_name: "",
      company: "",
      email: "",
      phone: "",
      brokerage: "",
      billing_same_as_property: true,
      billing_line1: "",
      billing_city: "",
      billing_state: "",
      billing_postal_code: "",
      marketing_opt_in: false,
      sms_opt_in: true,
    },
    paymentOption: "full",
    promoCode: "",
    discount: null,
    acceptTerms: false,
  };
}

export interface ServerQuoteResponse {
  quote: {
    subtotalCents: number;
    discountCents: number;
    discountLabel: string | null;
    discountNote: string | null;
    travelFeeCents: number;
    taxCents: number;
    totalCents: number;
    depositCents: number;
  };
  travel: { feeCents: number; message: string; outsideArea: boolean; rejected: boolean; areaName: string | null };
  discount: { ok: true; label: string } | { ok: false; error: string } | null;
  paymentOptions: PaymentOption[];
  taxLabel: string;
}
