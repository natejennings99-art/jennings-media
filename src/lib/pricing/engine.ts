/**
 * Pricing engine — pure functions shared by the booking UI (instant previews)
 * and the server (authoritative totals). Never trust client-computed prices.
 */
import type {
  AddOn,
  Catalog,
  LineItemType,
  Package,
  PaymentSettings,
  PriceTier,
  Service,
  SchedulingRules,
} from "@/lib/types";

export interface DiscountSpec {
  label: string;
  type: "percent" | "fixed";
  /** Percent (1–100) or cents. */
  value: number;
  maxCents?: number | null;
  minSubtotalCents?: number;
  promoCodeId?: string | null;
  referralCustomerId?: string | null;
}

export interface Selection {
  packageId: string | null;
  serviceIds: string[];
  /** Quantities for per-unit services (e.g. virtual twilight images). */
  serviceQuantities?: Record<string, number>;
  addOns: { id: string; quantity: number }[];
}

export interface PricingInput extends Selection {
  catalog: Catalog;
  squareFeet: number | null;
  travelFeeCents?: number;
  discount?: DiscountSpec | null;
  taxRateBps?: number;
  taxTravelFee?: boolean;
  payment?: Pick<PaymentSettings, "deposit_type" | "deposit_value">;
  defaultDurationMinutes?: number;
}

export interface QuoteLine {
  key: string;
  type: LineItemType;
  name: string;
  description: string | null;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  includedInPackage: boolean;
  serviceId: string | null;
  packageId: string | null;
  addOnId: string | null;
}

export interface Quote {
  lines: QuoteLine[];
  subtotalCents: number;
  discountCents: number;
  discountLabel: string | null;
  discountApplied: boolean;
  discountNote: string | null;
  travelFeeCents: number;
  taxCents: number;
  totalCents: number;
  depositCents: number;
  durationMinutes: number;
  /** Every service delivered by this order (package contents, selections, linked add-ons). */
  serviceIds: string[];
  rules: Required<Pick<SchedulingRules, "daylight_only" | "twilight">> & {
    min_notice_hours: number;
    skills: string[];
  };
  isEmpty: boolean;
}

const MAX_ON_SITE_MINUTES = 300;

/* ------------------------------------------------------------------ prices */

export function sortTiers(tiers: PriceTier[]) {
  return [...tiers].sort((a, b) => (a.max_sqft ?? Infinity) - (b.max_sqft ?? Infinity));
}

export function priceForSqft(baseCents: number, tiers: PriceTier[] | null | undefined, sqft: number | null) {
  if (!tiers || tiers.length === 0) return baseCents;
  const sorted = sortTiers(tiers);
  if (!sqft || sqft <= 0) return sorted[0].price_cents;
  for (const tier of sorted) {
    if (tier.max_sqft === null || sqft <= tier.max_sqft) return tier.price_cents;
  }
  return sorted[sorted.length - 1].price_cents;
}

/** Unit price of a service for a home of the given size. */
export function servicePrice(service: Pick<Service, "pricing_model" | "base_price_cents" | "price_tiers">, sqft: number | null) {
  return service.pricing_model === "sqft" ? priceForSqft(service.base_price_cents, service.price_tiers, sqft) : service.base_price_cents;
}

export function packagePrice(pkg: Pick<Package, "base_price_cents" | "price_tiers">, sqft: number | null) {
  return priceForSqft(pkg.base_price_cents, pkg.price_tiers, sqft);
}

export function addOnUnitPrice(addOn: AddOn, services: Map<string, Service>, sqft: number | null) {
  if (addOn.service_id) {
    const svc = services.get(addOn.service_id);
    if (svc) return servicePrice(svc, sqft);
  }
  return addOn.pricing_model === "sqft" ? priceForSqft(addOn.price_cents, addOn.price_tiers, sqft) : addOn.price_cents;
}

/** Lowest advertised price ("from $X"). */
export function startingPrice(item: { base_price_cents: number; price_tiers: PriceTier[] }) {
  if (!item.price_tiers?.length) return item.base_price_cents;
  return Math.min(...item.price_tiers.map((t) => t.price_cents));
}

export function isPerUnit(item: { pricing_model: string }) {
  return item.pricing_model === "per_unit";
}

function clampQty(qty: number | undefined, max: number | null | undefined) {
  const q = Math.max(1, Math.floor(qty ?? 1));
  return max ? Math.min(q, max) : q;
}

/* -------------------------------------------------------------- discounts */

export function computeDiscount(subtotalCents: number, discount: DiscountSpec | null | undefined) {
  if (!discount || subtotalCents <= 0) return { cents: 0, applied: false, note: null as string | null };
  if (discount.minSubtotalCents && subtotalCents < discount.minSubtotalCents) {
    return {
      cents: 0,
      applied: false,
      note: `Requires a subtotal of at least $${(discount.minSubtotalCents / 100).toFixed(0)}`,
    };
  }
  let cents =
    discount.type === "percent"
      ? Math.floor((subtotalCents * Math.min(discount.value, 100)) / 100)
      : Math.min(discount.value, subtotalCents);
  if (discount.maxCents) cents = Math.min(cents, discount.maxCents);
  return { cents, applied: cents > 0, note: null };
}

export function computeDeposit(totalCents: number, payment?: Pick<PaymentSettings, "deposit_type" | "deposit_value">) {
  if (!payment || totalCents <= 0) return totalCents;
  const raw =
    payment.deposit_type === "percent"
      ? Math.round((totalCents * Math.min(Math.max(payment.deposit_value, 1), 100)) / 100)
      : Math.min(payment.deposit_value, totalCents);
  return Math.max(Math.min(raw, totalCents), Math.min(totalCents, 50));
}

/* ------------------------------------------------------------------ quote */

export function buildQuote(input: PricingInput): Quote {
  const { catalog, squareFeet: sqft } = input;
  const services = new Map(catalog.services.map((s) => [s.id, s]));
  const addOns = new Map(catalog.addOns.map((a) => [a.id, a]));
  const pkg = input.packageId ? catalog.packages.find((p) => p.id === input.packageId) ?? null : null;

  const lines: QuoteLine[] = [];
  const delivered = new Set<string>();
  let durationMinutes = 0;

  if (pkg) {
    const unit = packagePrice(pkg, sqft);
    const included = pkg.services.map((ps) => services.get(ps.service_id)).filter((s): s is Service => Boolean(s));
    lines.push({
      key: `package:${pkg.id}`,
      type: "package",
      name: `${pkg.name} package`,
      description: included.map((s) => s.name).join(" · ") || pkg.tagline,
      quantity: 1,
      unitPriceCents: unit,
      totalCents: unit,
      includedInPackage: false,
      serviceId: null,
      packageId: pkg.id,
      addOnId: null,
    });
    for (const svc of included) {
      delivered.add(svc.id);
      durationMinutes += svc.duration_minutes;
      lines.push({
        key: `included:${svc.id}`,
        type: "service",
        name: svc.name,
        description: "Included in package",
        quantity: 1,
        unitPriceCents: 0,
        totalCents: 0,
        includedInPackage: true,
        serviceId: svc.id,
        packageId: pkg.id,
        addOnId: null,
      });
    }
  }

  for (const id of input.serviceIds) {
    const svc = services.get(id);
    if (!svc || !svc.is_bookable || delivered.has(id)) continue;
    const qty = isPerUnit(svc) ? clampQty(input.serviceQuantities?.[id], svc.max_quantity) : 1;
    const unit = servicePrice(svc, sqft);
    delivered.add(id);
    durationMinutes += svc.duration_minutes * (isPerUnit(svc) ? 0 : 1);
    lines.push({
      key: `service:${id}`,
      type: "service",
      name: svc.name,
      description: isPerUnit(svc) && svc.unit_label ? `${qty} × ${svc.unit_label}` : null,
      quantity: qty,
      unitPriceCents: unit,
      totalCents: unit * qty,
      includedInPackage: false,
      serviceId: id,
      packageId: null,
      addOnId: null,
    });
  }

  for (const sel of input.addOns) {
    const addOn = addOns.get(sel.id);
    if (!addOn || !addOn.is_active) continue;
    if (addOn.service_id && delivered.has(addOn.service_id)) continue;
    const linked = addOn.service_id ? services.get(addOn.service_id) : undefined;
    const perUnit = linked ? isPerUnit(linked) : isPerUnit(addOn);
    const qty = perUnit ? clampQty(sel.quantity, linked?.max_quantity ?? addOn.max_quantity) : 1;
    const unit = addOnUnitPrice(addOn, services, sqft);
    if (linked) {
      delivered.add(linked.id);
      durationMinutes += perUnit ? 0 : linked.duration_minutes;
    } else {
      durationMinutes += addOn.duration_minutes * qty;
    }
    const unitLabel = linked?.unit_label ?? addOn.unit_label;
    lines.push({
      key: `addon:${addOn.id}`,
      type: "add_on",
      name: addOn.name,
      description: perUnit && unitLabel ? `${qty} × ${unitLabel}` : null,
      quantity: qty,
      unitPriceCents: unit,
      totalCents: unit * qty,
      includedInPackage: false,
      serviceId: linked?.id ?? null,
      packageId: null,
      addOnId: addOn.id,
    });
  }

  const deliveredServices = [...delivered].map((id) => services.get(id)).filter((s): s is Service => Boolean(s));
  const rules = {
    daylight_only: deliveredServices.some((s) => s.scheduling_rules?.daylight_only),
    twilight: deliveredServices.some((s) => s.scheduling_rules?.twilight),
    min_notice_hours: Math.max(0, ...deliveredServices.map((s) => s.scheduling_rules?.min_notice_hours ?? 0)),
    skills: [...new Set(deliveredServices.map((s) => s.scheduling_rules?.requires_skill).filter((x): x is string => Boolean(x)))],
  };

  const subtotalCents = lines.reduce((sum, l) => sum + l.totalCents, 0);
  const discount = computeDiscount(subtotalCents, input.discount);
  const travelFeeCents = Math.max(0, input.travelFeeCents ?? 0);
  const taxable = subtotalCents - discount.cents + (input.taxTravelFee ? travelFeeCents : 0);
  const taxCents = Math.max(0, Math.round((taxable * (input.taxRateBps ?? 0)) / 10000));
  const totalCents = Math.max(0, subtotalCents - discount.cents + travelFeeCents + taxCents);
  const onSite = deliveredServices.some((s) => s.duration_minutes > 0) || durationMinutes > 0;

  return {
    lines,
    subtotalCents,
    discountCents: discount.cents,
    discountLabel: discount.applied ? input.discount?.label ?? null : null,
    discountApplied: discount.applied,
    discountNote: discount.note,
    travelFeeCents,
    taxCents,
    totalCents,
    depositCents: computeDeposit(totalCents, input.payment),
    durationMinutes: onSite
      ? Math.min(MAX_ON_SITE_MINUTES, Math.max(input.defaultDurationMinutes ?? 60, durationMinutes))
      : 0,
    serviceIds: [...delivered],
    rules,
    isEmpty: lines.length === 0,
  };
}

/* -------------------------------------------------------- recommendations */

export interface PackageRecommendation {
  package: Package;
  packagePriceCents: number;
  /** Price of wanted services that the package doesn't include. */
  extrasCents: number;
  /** What the customer's current order costs (chosen package + extras, or à la carte). */
  baselineCents: number;
  /** Everything wanted, bought individually. */
  alaCarteCents: number;
  savingsCents: number;
  coversAll: boolean;
  bonusServiceIds: string[];
  kind: "saves" | "upgrade";
}

/**
 * Compares the current order (individual services, or a package plus extras)
 * against every other package. Returns packages that are cheaper ("saves") or
 * cost only a little more while adding services ("upgrade").
 */
export function recommendPackages(
  catalog: Catalog,
  selection: Pick<Selection, "serviceIds" | "serviceQuantities"> & { packageId?: string | null },
  sqft: number | null
): PackageRecommendation[] {
  const services = new Map(catalog.services.map((s) => [s.id, s]));
  const current = selection.packageId ? catalog.packages.find((p) => p.id === selection.packageId) ?? null : null;
  const picked = selection.serviceIds.filter((id) => services.get(id)?.is_bookable);
  const wanted = [...new Set([...picked, ...(current ? current.services.map((s) => s.service_id) : [])])].filter((id) => services.has(id));
  if (wanted.length === 0) return [];

  const priceOf = (id: string) => {
    const svc = services.get(id)!;
    const qty = isPerUnit(svc) ? clampQty(selection.serviceQuantities?.[id], svc.max_quantity) : 1;
    return servicePrice(svc, sqft) * qty;
  };
  const alaCarte = wanted.reduce((sum, id) => sum + priceOf(id), 0);
  const baseline = current
    ? packagePrice(current, sqft) + picked.filter((id) => !current.services.some((s) => s.service_id === id)).reduce((sum, id) => sum + priceOf(id), 0)
    : alaCarte;

  const results: PackageRecommendation[] = [];
  for (const pkg of catalog.packages) {
    if (!pkg.is_active || pkg.id === current?.id) continue;
    const included = new Set(pkg.services.map((ps) => ps.service_id));
    if (!wanted.some((id) => included.has(id))) continue;
    const extras = wanted.filter((id) => !included.has(id));
    const extrasCents = extras.reduce((sum, id) => sum + priceOf(id), 0);
    const pkgCents = packagePrice(pkg, sqft);
    const savings = baseline - (pkgCents + extrasCents);
    const bonus = [...included].filter((id) => !wanted.includes(id));
    const isUpgrade = savings <= 0 && bonus.length > 0 && -savings <= Math.max(15000, baseline * 0.25);
    if (savings > 0 || isUpgrade) {
      results.push({
        package: pkg,
        packagePriceCents: pkgCents,
        extrasCents,
        baselineCents: baseline,
        alaCarteCents: alaCarte,
        savingsCents: savings,
        coversAll: extras.length === 0,
        bonusServiceIds: bonus,
        kind: savings > 0 ? "saves" : "upgrade",
      });
    }
  }
  return results.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "saves" ? -1 : 1;
    return a.kind === "saves" ? b.savingsCents - a.savingsCents : a.savingsCents - b.savingsCents;
  });
}

/** Add-ons relevant to what's already in the order. */
export function relevantAddOns(catalog: Catalog, orderServiceIds: string[]) {
  const inOrder = new Set(orderServiceIds);
  return catalog.addOns
    .filter((a) => a.is_active)
    .filter((a) => !(a.service_id && inOrder.has(a.service_id)))
    .filter((a) => a.show_always || a.trigger_service_ids.some((id) => inOrder.has(id)))
    .sort((a, b) => a.sort_order - b.sort_order);
}

/** Services included by a package, used to fold selections into a chosen package. */
export function packageServiceIds(pkg: Package | null | undefined) {
  return pkg ? pkg.services.map((s) => s.service_id) : [];
}
