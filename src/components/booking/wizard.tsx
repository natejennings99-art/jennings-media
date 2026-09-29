"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronUp, RotateCcw } from "lucide-react";
import type { Catalog, PaymentOption, PaymentSettings } from "@/lib/types";
import { buildQuote, packageServiceIds } from "@/lib/pricing/engine";
import { cn, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics";
import { submitBooking } from "@/app/book/actions";
import { STEPS, emptyDraft, type BookingDraft, type DraftCustomer, type DraftProperty, type ServerQuoteResponse } from "./types";
import { StepProperty } from "./step-property";
import { StepServices } from "./step-services";
import { StepPackage } from "./step-package";
import { StepAddOns } from "./step-addons";
import { StepSchedule } from "./step-schedule";
import { StepDetails } from "./step-details";
import { StepPayment } from "./step-payment";
import { OrderSummary } from "./order-summary";

const STORAGE_KEY = "jm-booking-draft-v2";

export interface WizardProps {
  catalog: Catalog;
  timezone: string;
  today: string;
  payment: PaymentSettings;
  paymentOptions: PaymentOption[];
  defaultDurationMinutes: number;
  prefill: Partial<DraftCustomer> | null;
  intent: { packageSlug?: string; serviceSlug?: string; resume?: boolean; cancelled?: boolean };
  signedIn: boolean;
}

function readDraft(): BookingDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookingDraft;
    return parsed?.v === 2 ? parsed : null;
  } catch {
    return null;
  }
}

export function BookingWizard(props: WizardProps) {
  const { catalog, timezone, today, payment, paymentOptions, prefill, intent } = props;
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState<BookingDraft>(() => ({ ...emptyDraft(), paymentOption: paymentOptions[0] ?? "later" }));
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [server, setServer] = useState<ServerQuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [onSite, setOnSite] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, startSubmit] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);

  // Restore saved progress, then apply URL intent (?package= / ?service=) and account prefill.
  useEffect(() => {
    const saved = readDraft();
    let next: BookingDraft = saved ?? { ...emptyDraft(), paymentOption: paymentOptions[0] ?? "later" };
    const pkg = intent.packageSlug ? catalog.packages.find((p) => p.slug === intent.packageSlug) : undefined;
    const svc = intent.serviceSlug ? catalog.services.find((s) => s.slug === intent.serviceSlug && s.is_bookable) : undefined;
    if (pkg) next = { ...next, packageId: pkg.id, step: saved && !intent.resume ? 0 : next.step };
    if (svc && !next.serviceIds.includes(svc.id)) next = { ...next, serviceIds: [...next.serviceIds, svc.id], step: saved && !intent.resume ? 0 : next.step };
    if (prefill) {
      const customer = { ...next.customer };
      (Object.keys(prefill) as (keyof DraftCustomer)[]).forEach((k) => {
        const v = prefill[k];
        if (v !== undefined && v !== null && v !== "" && !customer[k]) (customer as Record<string, unknown>)[k] = v;
      });
      next = { ...next, customer };
    }
    if (!paymentOptions.includes(next.paymentOption)) next = { ...next, paymentOption: paymentOptions[0] ?? "later" };
    if (next.slot && new Date(next.slot.start).getTime() < Date.now()) next = { ...next, slot: null };
    setDraft(next);
    setHydrated(true);
    if (saved && saved.step > 0 && !pkg && !svc) toast({ tone: "info", title: "Welcome back", description: "We saved your progress." });
    if (intent.cancelled) toast({ tone: "info", title: "Checkout cancelled", description: "Nothing was charged. Review your order and try again." });
    track("begin_booking");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch {
        /* storage unavailable (private mode) — progress simply isn't saved */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [draft, hydrated]);

  const sqft = Number(draft.property.square_feet) || null;
  const selection = useMemo(
    () => ({
      packageId: draft.packageId,
      serviceIds: draft.serviceIds,
      serviceQuantities: draft.serviceQuantities,
      addOns: Object.entries(draft.addOns).map(([id, quantity]) => ({ id, quantity })),
    }),
    [draft.packageId, draft.serviceIds, draft.serviceQuantities, draft.addOns]
  );
  const quote = useMemo(
    () => buildQuote({ catalog, squareFeet: sqft, ...selection, discount: draft.discount, payment, defaultDurationMinutes: props.defaultDurationMinutes }),
    [catalog, sqft, selection, draft.discount, payment, props.defaultDurationMinutes]
  );

  const addressReady =
    draft.property.address_line1.trim().length > 2 && draft.property.city.trim().length > 1 && /^[A-Za-z]{2}$/.test(draft.property.state) && /^\d{5}/.test(draft.property.postal_code);

  // Authoritative quote (travel fee, promo, tax) from the server.
  useEffect(() => {
    if (!hydrated || !addressReady || quote.isEmpty || draft.step < 3) return;
    const controller = new AbortController();
    const t = setTimeout(() => {
      setLoadingQuote(true);
      fetch("/api/booking/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          selection,
          squareFeet: sqft,
          address: {
            address_line1: draft.property.address_line1,
            city: draft.property.city,
            state: draft.property.state.toUpperCase(),
            postal_code: draft.property.postal_code,
          },
          promoCode: draft.discount ? draft.promoCode : null,
          email: draft.customer.email || null,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((json: ServerQuoteResponse | null) => json && setServer(json))
        .catch(() => undefined)
        .finally(() => setLoadingQuote(false));
    }, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [hydrated, addressReady, quote.isEmpty, draft.step, selection, sqft, draft.property.address_line1, draft.property.city, draft.property.state, draft.property.postal_code, draft.discount, draft.promoCode, draft.customer.email]);

  const update = useCallback((patch: Partial<BookingDraft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const updateProperty = (patch: Partial<DraftProperty>) => {
    setDraft((d) => ({ ...d, property: { ...d.property, ...patch }, slot: "square_feet" in patch ? null : d.slot }));
    setErrors({});
  };
  const updateCustomer = (patch: Partial<DraftCustomer>) => {
    setDraft((d) => ({ ...d, customer: { ...d.customer, ...patch } }));
    setErrors({});
  };

  const goTo = (step: number) => {
    setDraft((d) => ({ ...d, step }));
    setErrors({});
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    track("booking_step", { step: STEPS[step]?.key });
  };

  function validate(step: number): Record<string, string> {
    const e: Record<string, string> = {};
    const p = draft.property;
    if (step === 0) {
      if (p.address_line1.trim().length < 3) e["property.address_line1"] = "Enter the street address";
      if (p.city.trim().length < 2) e["property.city"] = "Enter the city";
      if (!/^[A-Za-z]{2}$/.test(p.state)) e["property.state"] = "2 letters";
      if (!/^\d{5}(-\d{4})?$/.test(p.postal_code.trim())) e["property.postal_code"] = "5-digit ZIP";
      if (!sqft || sqft < 200) e["property.square_feet"] = "Approximate sq ft";
    }
    if (step === 1 && draft.serviceIds.length === 0 && !draft.packageId) e.services = "Choose at least one service to continue.";
    if (step === 4 && onSite && !draft.slot && !draft.requestWithoutSlot) e.slot = "Choose a time, or let us know you're flexible.";
    if (step === 5) {
      const c = draft.customer;
      if (!c.first_name.trim()) e["customer.first_name"] = "Required";
      if (!c.last_name.trim()) e["customer.last_name"] = "Required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim())) e["customer.email"] = "Enter a valid email";
      if (c.phone.replace(/\D/g, "").length < 10) e["customer.phone"] = "Enter a valid phone number";
    }
    if (step === 6 && !draft.acceptTerms) e.acceptTerms = "Please accept the booking terms.";
    return e;
  }

  const next = () => {
    const e = validate(draft.step);
    if (Object.keys(e).length) {
      setErrors(e);
      toast({ tone: "error", title: Object.values(e)[0] });
      return;
    }
    if (draft.step < STEPS.length - 1) goTo(draft.step + 1);
    else submit();
  };

  const stepForField = (field: string) => (field.startsWith("property.") ? 0 : field.startsWith("customer.") ? 5 : field === "slotStart" ? 4 : 6);

  function submit() {
    const p = draft.property;
    const c = draft.customer;
    const payload = {
      property: {
        ...p,
        state: p.state.toUpperCase(),
        square_feet: Number(p.square_feet),
        bedrooms: p.bedrooms ? Number(p.bedrooms) : null,
        bathrooms: p.bathrooms ? Number(p.bathrooms) : null,
        preferred_date: p.preferred_date || (draft.slot ? draft.slot.date : null),
        arrival_window: p.arrival_window || null,
        listing_status: p.listing_status || null,
      },
      selection,
      slotStart: onSite && draft.slot && !draft.requestWithoutSlot ? draft.slot.start : null,
      customer: {
        first_name: c.first_name,
        last_name: c.last_name,
        company: c.company,
        email: c.email,
        phone: c.phone,
        brokerage: c.brokerage,
        billing_same_as_property: c.billing_same_as_property,
        billing_address: c.billing_same_as_property ? null : { line1: c.billing_line1, city: c.billing_city, state: c.billing_state, postal_code: c.billing_postal_code },
        marketing_opt_in: c.marketing_opt_in,
        sms_opt_in: c.sms_opt_in,
      },
      paymentOption: draft.paymentOption,
      promoCode: draft.discount ? draft.promoCode : null,
      acceptTerms: draft.acceptTerms,
      website: "",
    };
    startSubmit(async () => {
      const res = await submitBooking(payload);
      if (!res.ok) {
        const fields = res.fieldErrors ?? {};
        setErrors(fields);
        const first = Object.keys(fields)[0];
        if (first) {
          const step = stepForField(first);
          if (step !== draft.step) goTo(step);
          if (first === "slotStart") update({ slot: null });
          setErrors(fields);
        }
        toast({ tone: "error", title: res.error });
        return;
      }
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      if (/^https?:\/\//.test(res.data.redirectUrl)) window.location.assign(res.data.redirectUrl);
      else router.push(res.data.redirectUrl);
    });
  }

  const step = draft.step;
  const isLast = step === STEPS.length - 1;
  const dueToday =
    draft.paymentOption === "full" ? server?.quote.totalCents ?? quote.totalCents : draft.paymentOption === "deposit" ? server?.quote.depositCents ?? quote.depositCents : 0;
  const ctaLabel = isLast
    ? dueToday > 0
      ? `Pay ${formatMoney(dueToday, "usd", { exact: true })}`
      : "Confirm booking"
    : step === 2 && draft.packageId
      ? "Continue with package"
      : "Continue";
  const orderServiceIds = quote.serviceIds.length ? quote.serviceIds : [...draft.serviceIds, ...packageServiceIds(catalog.packages.find((p) => p.id === draft.packageId))];

  if (!hydrated) {
    return <div className="container-page min-h-[70vh] animate-pulse pt-32" aria-busy />;
  }

  return (
    <div ref={topRef} className="scroll-mt-24">
      {/* Progress */}
      <div className="container-page pt-24 sm:pt-28">
        <div className="flex items-center justify-between gap-4 lg:hidden">
          <p className="text-sm text-mist-400">
            Step {step + 1} of {STEPS.length} · <span className="text-bone-100">{STEPS[step].label}</span>
          </p>
          {step > 0 && (
            <button type="button" onClick={() => { setDraft({ ...emptyDraft(), paymentOption: paymentOptions[0] ?? "later" }); setServer(null); }} className="flex items-center gap-1 text-[12px] text-mist-500 hover:text-bone-50">
              <RotateCcw className="size-3" /> Start over
            </button>
          )}
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10 lg:hidden">
          <div className="h-full rounded-full bg-gold-300 transition-[width] duration-700 ease-(--ease-expo)" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <ol className="hidden items-center gap-2 lg:flex">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && goTo(i)}
                disabled={i >= step}
                className={cn("flex items-center gap-2.5 text-[13px] whitespace-nowrap transition", i === step ? "text-bone-50" : i < step ? "text-mist-300 hover:text-bone-50" : "text-mist-600")}
              >
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-full border text-[12px] transition-all duration-500",
                    i < step && "border-gold-300 bg-gold-300 text-ink-950",
                    i === step && "border-gold-300 text-gold-200 shadow-[0_0_20px_rgb(230_201_152/0.35)]",
                    i > step && "border-white/15"
                  )}
                >
                  {i < step ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && <span className={cn("h-px flex-1 transition-colors duration-500", i < step ? "bg-gold-300/60" : "bg-white/10")} />}
            </li>
          ))}
        </ol>
      </div>

      <div className="container-page grid gap-10 pt-10 pb-40 lg:grid-cols-[minmax(0,1fr)_380px] lg:pb-24">
        <div key={step} className="min-w-0 animate-fade-up">
          {step === 0 && <StepProperty value={draft.property} onChange={updateProperty} errors={errors} minDate={today} />}
          {step === 1 && (
            <>
              <StepServices
                catalog={catalog}
                sqft={sqft}
                selected={draft.serviceIds}
                quantities={draft.serviceQuantities}
                packageId={draft.packageId}
                onToggle={(id) => {
                  setErrors({});
                  update({ serviceIds: draft.serviceIds.includes(id) ? draft.serviceIds.filter((x) => x !== id) : [...draft.serviceIds, id], slot: null });
                }}
                onQuantity={(id, qty) => update({ serviceQuantities: { ...draft.serviceQuantities, [id]: qty } })}
              />
              {errors.services && <p className="mt-4 text-sm text-red-300">{errors.services}</p>}
            </>
          )}
          {step === 2 && (
            <StepPackage
              catalog={catalog}
              sqft={sqft}
              serviceIds={draft.serviceIds}
              quantities={draft.serviceQuantities}
              packageId={draft.packageId}
              onChoose={(id) => update({ packageId: id, slot: null })}
            />
          )}
          {step === 3 && (
            <StepAddOns
              catalog={catalog}
              sqft={sqft}
              orderServiceIds={orderServiceIds}
              selected={draft.addOns}
              onToggle={(id) => {
                const nextAddOns = { ...draft.addOns };
                if (id in nextAddOns) delete nextAddOns[id];
                else nextAddOns[id] = 1;
                update({ addOns: nextAddOns, slot: null });
              }}
              onQuantity={(id, qty) => update({ addOns: { ...draft.addOns, [id]: qty } })}
            />
          )}
          {step === 4 && (
            <StepSchedule
              request={{
                selection,
                squareFeet: sqft,
                address: { line1: draft.property.address_line1, city: draft.property.city, state: draft.property.state.toUpperCase(), postalCode: draft.property.postal_code },
              }}
              slot={draft.slot}
              preferredDate={draft.property.preferred_date}
              arrivalWindow={draft.property.arrival_window}
              today={today}
              requestWithoutSlot={draft.requestWithoutSlot}
              onSelect={(slot) => {
                setErrors({});
                update({ slot, requestWithoutSlot: slot ? false : draft.requestWithoutSlot });
              }}
              onRequestWithoutSlot={(v) => update({ requestWithoutSlot: v })}
              onOnSiteChange={setOnSite}
              error={errors.slot ?? errors.slotStart}
            />
          )}
          {step === 5 && <StepDetails value={draft.customer} onChange={updateCustomer} errors={errors} signedIn={props.signedIn} />}
          {step === 6 && (
            <StepPayment
              options={paymentOptions}
              option={draft.paymentOption}
              onOption={(o) => update({ paymentOption: o })}
              server={server}
              loadingQuote={loadingQuote}
              payment={payment}
              promoCode={draft.promoCode}
              onPromoCode={(v) => update({ promoCode: v })}
              discount={draft.discount}
              onDiscount={(d) => update({ discount: d })}
              email={draft.customer.email}
              acceptTerms={draft.acceptTerms}
              onAcceptTerms={(v) => {
                setErrors({});
                update({ acceptTerms: v });
              }}
              errors={errors}
            />
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-4">
            <OrderSummary quote={quote} server={step >= 3 ? server : null} property={draft.property} slot={draft.slot} timezone={timezone} />
            <p className="px-2 text-[12.5px] leading-relaxed text-mist-500">Questions? Reply to your confirmation email or call us — a real person answers.</p>
          </div>
        </aside>
      </div>

      {/* Action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-ink-950/85 backdrop-blur-2xl" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {summaryOpen && (
          <div className="container-page max-h-[60vh] overflow-y-auto pt-4 lg:hidden">
            <OrderSummary quote={quote} server={step >= 3 ? server : null} property={draft.property} slot={draft.slot} timezone={timezone} compact />
          </div>
        )}
        <div className="container-page flex items-center justify-between gap-3 py-3">
          <button type="button" onClick={() => setSummaryOpen((v) => !v)} className="flex min-w-0 items-center gap-2 text-left lg:pointer-events-none" aria-expanded={summaryOpen}>
            <span>
              <span className="block text-[11px] tracking-[0.12em] text-mist-500 uppercase">{isLast && dueToday > 0 ? "Due today" : "Total"}</span>
              <span className="block text-xl font-medium tracking-[-0.02em] tabular-nums">
                {formatMoney(isLast && dueToday > 0 ? dueToday : server && step >= 3 ? server.quote.totalCents : quote.totalCents, "usd", { exact: true })}
              </span>
            </span>
            <ChevronUp className={cn("size-4 text-mist-400 transition lg:hidden", summaryOpen && "rotate-180")} />
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="ghost" size="lg" onClick={() => goTo(step - 1)} className="px-4" aria-label="Back">
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            <Button size="lg" onClick={next} loading={submitting} className="min-w-40">
              {ctaLabel}
              {!submitting && <ArrowRight className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
