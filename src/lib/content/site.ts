/**
 * Marketing copy. Edit freely — this file controls the words on the public site
 * that aren't managed from the admin dashboard.
 */
export const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const HERO = {
  eyebrow: "Real estate media studio",
  headlineLead: "Real Estate Media That",
  headlineAccent: "Sells",
  headlineTail: "the Property.",
  subheadline:
    "Professional photography, cinematic video, drone media, floor plans, 3D tours and property marketing — all in one place. Book online in two minutes. Photos in your inbox by the next morning.",
};

export const MARQUEE_WORDS = [
  "Photography",
  "Cinematic Video",
  "Drone",
  "Matterport 3D",
  "Floor Plans",
  "Virtual Twilight",
  "Property Websites",
  "Social Reels",
  "Marketing Kits",
];

export const STATS = [
  { value: 24, suffix: "h", label: "Standard photo turnaround" },
  { value: 4, suffix: "K", label: "Cinematic video & aerials" },
  { value: 2, suffix: " min", label: "To book online, 24/7" },
  { value: 1, suffix: " visit", label: "For photo, video, drone & 3D" },
];

export const WHY_US = [
  { icon: "zap", title: "Fast turnaround", body: "Photos delivered by the next morning. Video and 3D within 48 hours. Rush same-day when you need it." },
  { icon: "sparkles", title: "Professional editing", body: "Every frame is hand-edited: HDR blending, window pulls, perfect verticals and true-to-life color." },
  { icon: "calendar", title: "Easy online booking", body: "Pick services, see live pricing and choose a time in minutes. No phone tag, no back-and-forth." },
  { icon: "layers", title: "Consistent quality", body: "One visual standard on every listing, so your brand looks premium whether it's a condo or an estate." },
  { icon: "plane", title: "Drone services", body: "FAA Part 107 licensed pilots capture lots, views and neighborhood context in 4K." },
  { icon: "badge-check", title: "Listing-ready media", body: "MLS-sized, print-ready and social-ready files, plus unbranded tours and videos for the MLS." },
  { icon: "megaphone", title: "All-in-one marketing", body: "Property websites, reels, flyers and social graphics — your whole launch from a single order." },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Book your property",
    body: "Choose a package or build your own, see your price instantly and pick a time that works. Two minutes, any hour.",
  },
  {
    step: "02",
    title: "We capture the media",
    body: "Your photographer arrives on time with pro-grade cameras, gimbals, drones and 3D scanners — and follows a shot list tuned to your listing.",
  },
  {
    step: "03",
    title: "Receive your finished content",
    body: "Edited media lands in your dashboard by the next morning, ready to download, share and upload to the MLS.",
  },
] as const;

export const FAQS = [
  {
    q: "How fast will I get my photos?",
    a: "Standard photography is delivered by 9 AM the next morning. Cinematic video, reels and 3D tours are delivered within 48 hours. Need it sooner? Add Rush Delivery for same-day turnaround on shoots finished before 1 PM.",
  },
  {
    q: "How should the home be prepared?",
    a: "Turn on every light, open blinds, clear countertops, hide personal items and move cars from the driveway. We'll email a simple prep checklist with your confirmation.",
  },
  {
    q: "Do I need to be there for the shoot?",
    a: "No. Leave lockbox or access instructions during booking and we'll handle the rest. We'll text when we arrive and when we leave.",
  },
  {
    q: "What happens if the weather is bad?",
    a: "Interior photography goes ahead rain or shine. For drone and twilight sessions, we'll reschedule the exterior portion at no charge if conditions aren't right.",
  },
  {
    q: "Are your drone pilots licensed?",
    a: "Yes. Every drone flight is performed by an FAA Part 107 certified pilot, and we handle airspace authorizations where required.",
  },
  {
    q: "Can I get unbranded media for the MLS?",
    a: "Absolutely. Videos, 3D tours and property websites include both a branded version and an MLS-compliant unbranded link.",
  },
  {
    q: "How does payment work?",
    a: "Pay in full or place a deposit securely by card when you book, or choose pay-after-shoot where available. Media is released once the invoice is settled.",
  },
  {
    q: "Can I reschedule or cancel?",
    a: "Yes. Reschedule or cancel free of charge up to 24 hours before your appointment from your dashboard or by replying to your confirmation email.",
  },
] as const;

export const ABOUT = {
  mission:
    "We exist to help real estate professionals market properties better. Great media isn't decoration — it's the first showing. Our job is to make every listing look its absolute best, arrive on time, and make the whole process feel effortless.",
  process: [
    { title: "Plan", body: "Every order gets a shot list tuned to the property type, light and your goals." },
    { title: "Capture", body: "Bracketed photography, stabilized 4K video, aerials and laser-measured scans in one visit." },
    { title: "Craft", body: "Hand editing, color grading and quality control on every single file." },
    { title: "Deliver", body: "Organized galleries, MLS-ready sizes and share links — straight to your dashboard." },
  ],
  equipment: [
    "Full-frame mirrorless cameras & tilt-shift lenses",
    "3-axis gimbals for cinematic motion",
    "4K drones flown by FAA Part 107 pilots",
    "Matterport Pro 3D scanners",
    "Laser measurement for floor plans",
    "Calibrated monitors for true-to-life color",
  ],
  standards: [
    "Straight verticals on every interior",
    "Balanced windows — no blown-out views",
    "Consistent white balance across the gallery",
    "Every frame reviewed before delivery",
  ],
};
