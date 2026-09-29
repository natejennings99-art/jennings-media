/**
 * Transactional email templates. Plain functions that return { subject, html, text }
 * with inline styles for broad client support. All interpolated values are escaped.
 */

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface Brand {
  name: string;
  email: string | null;
  phone: string | null;
  siteUrl: string;
}

export interface BookingEmailData {
  brand: Brand;
  customerName: string;
  orderNumber: string;
  address: string;
  when: string | null;
  services: string[];
  total: string;
  paid: string;
  due: string;
  paymentLabel: string;
  dashboardUrl: string;
  statusLabel: string;
  note?: string | null;
}

const esc = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

function layout(brand: Brand, preheader: string, body: string) {
  const contact = [brand.email, brand.phone].filter(Boolean).map(esc).join(" · ");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(brand.name)}</title></head>
<body style="margin:0;padding:0;background:#f3f1ec;font-family:${FONT};color:#15171a;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1ec;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e6e1d7;">
<tr><td style="background:#0b0c0f;padding:26px 36px;">
<span style="font-size:18px;font-weight:800;letter-spacing:-0.5px;text-transform:uppercase;color:#f7f4ee;">${esc(brand.name)}</span><span style="font-size:18px;font-weight:800;color:#ff5b24;">.</span>
</td></tr>
<tr><td style="padding:36px 36px 12px;font-size:15px;line-height:1.6;color:#2a2d31;">${body}</td></tr>
<tr><td style="padding:12px 36px 32px;font-size:12.5px;line-height:1.6;color:#8a857c;border-top:1px solid #efebe3;">
${esc(brand.name)}${contact ? ` · ${contact}` : ""}<br><a href="${esc(brand.siteUrl)}" style="color:#d43d0a;text-decoration:none;">${esc(brand.siteUrl.replace(/^https?:\/\//, ""))}</a>
</td></tr></table></td></tr></table></body></html>`;
}

const h1 = (text: string) => `<h1 style="margin:0 0 14px;font-size:26px;line-height:1.2;letter-spacing:-0.6px;color:#0b0c0f;font-weight:600;">${esc(text)}</h1>`;
const p = (html: string) => `<p style="margin:0 0 16px;">${html}</p>`;
const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 22px;"><tr><td style="border-radius:999px;background:#0b0c0f;"><a href="${esc(href)}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${esc(label)} &rarr;</a></td></tr></table>`;

function details(rows: [string, string | null | undefined][]) {
  const filtered = rows.filter(([, v]) => v);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px;border:1px solid #efebe3;border-radius:14px;">
${filtered
  .map(
    ([k, v], i) =>
      `<tr><td style="padding:12px 16px;font-size:13px;color:#8a857c;width:38%;${i ? "border-top:1px solid #f3efe7;" : ""}">${esc(k)}</td><td style="padding:12px 16px;font-size:14px;color:#15171a;${i ? "border-top:1px solid #f3efe7;" : ""}">${esc(v)}</td></tr>`
  )
  .join("")}</table>`;
}

function bookingDetails(d: BookingEmailData, extra: [string, string | null | undefined][] = []) {
  return details([
    ["Order", d.orderNumber],
    ["Property", d.address],
    ["Appointment", d.when],
    ["Services", d.services.join(", ")],
    ["Total", d.total],
    ...extra,
  ]);
}

function text(...lines: (string | null | undefined | false)[]) {
  return lines.filter(Boolean).join("\n");
}

/* ------------------------------------------------------------ customer */

export function bookingReceived(d: BookingEmailData): EmailContent {
  return {
    subject: `We've got your booking — ${d.orderNumber}`,
    html: layout(
      d.brand,
      `Booking ${d.orderNumber} received for ${d.address}.`,
      `${h1(`Thanks, ${d.customerName}!`)}${p(
        `We've received your booking for <strong>${esc(d.address)}</strong>. ${esc(d.note ?? "We'll confirm the details shortly.")}`
      )}${bookingDetails(d, [["Payment", d.paymentLabel]])}${button(d.dashboardUrl, "View your booking")}${p(
        `<span style="color:#6b675f;font-size:13.5px;">Prep tip: turn on every light, open the blinds, clear countertops and move cars from the driveway before we arrive.</span>`
      )}`
    ),
    text: text(`Thanks, ${d.customerName}!`, `We've received booking ${d.orderNumber} for ${d.address}.`, d.when && `Appointment: ${d.when}`, `Total: ${d.total}`, `View it: ${d.dashboardUrl}`),
  };
}

export function bookingConfirmed(d: BookingEmailData): EmailContent {
  return {
    subject: `Confirmed: ${d.address}${d.when ? ` · ${d.when}` : ""}`,
    html: layout(
      d.brand,
      `Your shoot is confirmed${d.when ? ` for ${d.when}` : ""}.`,
      `${h1("Your shoot is confirmed")}${p(`Great news — we're all set for <strong>${esc(d.address)}</strong>.`)}${bookingDetails(d, [
        ["Paid", d.paid],
        ["Balance", d.due],
      ])}${button(d.dashboardUrl, "Open your dashboard")}${p(
        `<span style="color:#6b675f;font-size:13.5px;">Need to reschedule? Reply to this email or visit your dashboard at least 24 hours before your appointment.</span>`
      )}`
    ),
    text: text("Your shoot is confirmed.", d.address, d.when && `When: ${d.when}`, `Dashboard: ${d.dashboardUrl}`),
  };
}

export function bookingReminder(d: BookingEmailData): EmailContent {
  return {
    subject: `Reminder: your shoot ${d.when ? `is ${d.when}` : "is coming up"}`,
    html: layout(
      d.brand,
      `See you soon at ${d.address}.`,
      `${h1("See you soon")}${p(`This is a friendly reminder about your upcoming shoot at <strong>${esc(d.address)}</strong>.`)}${bookingDetails(d)}${p(
        `<strong>Quick prep checklist</strong><br>• All lights on, blinds open<br>• Counters and tables cleared<br>• Cars out of the driveway<br>• Pets secured, personal items tucked away`
      )}${button(d.dashboardUrl, "View booking")}`
    ),
    text: text("Reminder: your shoot is coming up.", d.address, d.when && `When: ${d.when}`, `Details: ${d.dashboardUrl}`),
  };
}

export function shootCompleted(d: BookingEmailData): EmailContent {
  return {
    subject: `Shoot complete — ${d.address}`,
    html: layout(
      d.brand,
      "Your media is now in editing.",
      `${h1("That's a wrap 🎬")}${p(`We've finished capturing <strong>${esc(d.address)}</strong>. Your media is now with our editors — we'll email you the moment it's ready.`)}${bookingDetails(d)}${button(d.dashboardUrl, "Track progress")}`
    ),
    text: text("Shoot complete — your media is in editing.", d.address, `Track progress: ${d.dashboardUrl}`),
  };
}

export function mediaReady(d: BookingEmailData & { balanceDue: boolean }): EmailContent {
  return {
    subject: `Your media is ready — ${d.address}`,
    html: layout(
      d.brand,
      "Download your finished media now.",
      `${h1("Your media is ready")}${p(
        `Every photo, video and file for <strong>${esc(d.address)}</strong> is now in your dashboard — ready to download, share and upload to the MLS.`
      )}${d.balanceDue ? p(`<span style="color:#d43d0a;">A balance of <strong>${esc(d.due)}</strong> is due — you can pay securely from the same page.</span>`) : ""}${button(d.dashboardUrl, "Download your media")}`
    ),
    text: text("Your media is ready!", d.address, d.balanceDue && `Balance due: ${d.due}`, `Download: ${d.dashboardUrl}`),
  };
}

export function paymentReceived(d: BookingEmailData & { amount: string; receiptUrl?: string | null }): EmailContent {
  return {
    subject: `Payment received — ${d.amount}`,
    html: layout(
      d.brand,
      `We received your payment of ${d.amount}.`,
      `${h1("Payment received")}${p(`Thank you! We received <strong>${esc(d.amount)}</strong> for order ${esc(d.orderNumber)}.`)}${details([
        ["Order", d.orderNumber],
        ["Property", d.address],
        ["Amount", d.amount],
        ["Total paid", d.paid],
        ["Balance", d.due],
      ])}${d.receiptUrl ? button(d.receiptUrl, "View receipt") : button(d.dashboardUrl, "View invoice")}`
    ),
    text: text(`Payment received: ${d.amount}`, `Order ${d.orderNumber}`, `Balance: ${d.due}`, d.receiptUrl ?? d.dashboardUrl),
  };
}

export function invoiceDue(d: BookingEmailData & { invoiceNumber: string; payUrl: string; dueDate: string | null }): EmailContent {
  return {
    subject: `Invoice ${d.invoiceNumber} — ${d.due} due`,
    html: layout(
      d.brand,
      `Invoice ${d.invoiceNumber}: ${d.due} due.`,
      `${h1("Your invoice")}${p(`Here's your invoice for <strong>${esc(d.address)}</strong>.`)}${details([
        ["Invoice", d.invoiceNumber],
        ["Order", d.orderNumber],
        ["Total", d.total],
        ["Paid", d.paid],
        ["Amount due", d.due],
        ["Due date", d.dueDate],
      ])}${button(d.payUrl, "Pay securely")}`
    ),
    text: text(`Invoice ${d.invoiceNumber}`, `Amount due: ${d.due}`, `Pay: ${d.payUrl}`),
  };
}

export function bookingChanged(d: BookingEmailData & { changes: string[] }): EmailContent {
  return {
    subject: `Booking updated — ${d.orderNumber}`,
    html: layout(
      d.brand,
      "Your booking details changed.",
      `${h1("Your booking was updated")}${p(`We've updated your booking for <strong>${esc(d.address)}</strong>:`)}${p(
        d.changes.map((c) => `• ${esc(c)}`).join("<br>")
      )}${bookingDetails(d)}${button(d.dashboardUrl, "Review booking")}`
    ),
    text: text("Your booking was updated:", ...d.changes.map((c) => `- ${c}`), `Review: ${d.dashboardUrl}`),
  };
}

export function bookingCancelled(d: BookingEmailData & { reason?: string | null }): EmailContent {
  return {
    subject: `Booking cancelled — ${d.orderNumber}`,
    html: layout(
      d.brand,
      "Your booking has been cancelled.",
      `${h1("Booking cancelled")}${p(`Your booking <strong>${esc(d.orderNumber)}</strong> for ${esc(d.address)} has been cancelled.`)}${
        d.reason ? p(`<span style="color:#6b675f;">Reason: ${esc(d.reason)}</span>`) : ""
      }${p("If this was a mistake or you'd like to rebook, we're one click away.")}${button(`${d.brand.siteUrl}/book`, "Book again")}`
    ),
    text: text(`Booking ${d.orderNumber} cancelled.`, d.reason && `Reason: ${d.reason}`, `Rebook: ${d.brand.siteUrl}/book`),
  };
}

export function clientMessage(d: BookingEmailData & { message: string }): EmailContent {
  return {
    subject: `A message about your booking ${d.orderNumber}`,
    html: layout(
      d.brand,
      d.message.slice(0, 90),
      `${h1(`Hi ${d.customerName},`)}${p(esc(d.message).replace(/\n/g, "<br>"))}${button(d.dashboardUrl, "View booking")}`
    ),
    text: text(`Hi ${d.customerName},`, d.message, d.dashboardUrl),
  };
}

export function referralReward(brand: Brand, data: { name: string; code: string; amount: string; referredName: string }): EmailContent {
  return {
    subject: `You earned ${data.amount} — thanks for the referral!`,
    html: layout(
      brand,
      `Your referral reward code: ${data.code}`,
      `${h1("Thanks for spreading the word")}${p(`${esc(data.referredName)} just booked with us using your referral. Here's <strong>${esc(data.amount)}</strong> off your next shoot:`)}<p style="margin:18px 0;font-size:24px;font-weight:700;letter-spacing:2px;color:#0b0c0f;">${esc(data.code)}</p>${button(`${brand.siteUrl}/book`, "Book your next shoot")}`
    ),
    text: text(`You earned ${data.amount}!`, `Code: ${data.code}`, `${brand.siteUrl}/book`),
  };
}

export function contactAutoReply(brand: Brand, data: { name: string }): EmailContent {
  return {
    subject: `Thanks for reaching out, ${data.name}`,
    html: layout(
      brand,
      "We'll be in touch shortly.",
      `${h1(`Thanks, ${data.name}!`)}${p("We received your message and a member of our team will reply within one business day.")}${p("Need a shoot on the calendar sooner? You can book online in about two minutes.")}${button(`${brand.siteUrl}/book`, "Book a Shoot")}`
    ),
    text: text(`Thanks, ${data.name}! We received your message and will reply within one business day.`, `${brand.siteUrl}/book`),
  };
}

/* --------------------------------------------------------------- admin */

export function adminNewBooking(d: BookingEmailData & { customerEmail: string; customerPhone: string | null; adminUrl: string; flags: string[] }): EmailContent {
  return {
    subject: `New booking ${d.orderNumber} — ${d.total}`,
    html: layout(
      d.brand,
      `${d.customerName} booked ${d.address}`,
      `${h1("New booking")}${d.flags.length ? p(`<span style="color:#b45309;">${d.flags.map(esc).join("<br>")}</span>`) : ""}${details([
        ["Customer", d.customerName],
        ["Email", d.customerEmail],
        ["Phone", d.customerPhone],
        ["Order", d.orderNumber],
        ["Property", d.address],
        ["Appointment", d.when],
        ["Services", d.services.join(", ")],
        ["Total", d.total],
        ["Payment", d.paymentLabel],
      ])}${button(d.adminUrl, "Open in admin")}`
    ),
    text: text(`New booking ${d.orderNumber}`, d.customerName, d.address, d.when, d.total, d.adminUrl),
  };
}

export function adminNewLead(brand: Brand, lead: { name: string; email: string; phone?: string | null; company?: string | null; reason: string; message: string; adminUrl: string }): EmailContent {
  return {
    subject: `New inquiry from ${lead.name} (${lead.reason.replace("_", " ")})`,
    html: layout(
      brand,
      lead.message.slice(0, 90),
      `${h1("New contact inquiry")}${details([
        ["Name", lead.name],
        ["Email", lead.email],
        ["Phone", lead.phone],
        ["Company", lead.company],
        ["Reason", lead.reason.replace("_", " ")],
      ])}${p(esc(lead.message).replace(/\n/g, "<br>"))}${button(lead.adminUrl, "View lead")}`
    ),
    text: text(`New inquiry from ${lead.name} <${lead.email}>`, lead.message, lead.adminUrl),
  };
}

export function adminEvent(brand: Brand, title: string, lines: string[], url: string): EmailContent {
  return {
    subject: title,
    html: layout(brand, title, `${h1(title)}${p(lines.map(esc).join("<br>"))}${button(url, "Open in admin")}`),
    text: text(title, ...lines, url),
  };
}
