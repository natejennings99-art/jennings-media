/**
 * Content for /luxury-presence-alternative.
 *
 * Search Console shows people searching "luxury presence vs jennings media"
 * (12 impressions, 0 clicks, misspelled both times) — a vendor-comparison
 * query, which means someone actively choosing. Nothing on the site answered
 * it.
 *
 * Everything said about Luxury Presence here is taken from their own public
 * site: the product list is their navigation, and the absence of published
 * pricing is a fact (their /pricing path 404s; the site routes to "book a demo").
 * Nothing is invented and nothing is disparaged — a comparison page that
 * misrepresents a competitor is both dishonest and a Lanham Act problem, and
 * an agent can see through it anyway.
 */

export const COMPARE_FAQ = [
  {
    q: "Is Jennings Media a Luxury Presence competitor?",
    a: "Not really, and that is the honest answer. Luxury Presence sells software — a website, a CRM, AI tools and managed advertising. We are a production studio: we turn up at your listing and shoot it. Plenty of agents use a platform for their site and someone local for the photography, because those are different jobs.",
  },
  {
    q: "What does Luxury Presence cost?",
    a: "They do not publish pricing; their site routes you to a demo. We publish ours, and you can book online without talking to anyone. That difference matters more to some people than others.",
  },
  {
    q: "Which should I choose?",
    a: "If you need a branded website, a CRM and ongoing marketing run for you, a platform is the right shape of thing and we would tell you so. If you need this week's listing photographed, filmed and delivered quickly by someone in Tampa Bay, that is us.",
  },
  {
    q: "Can I use both?",
    a: "Yes, and many agents do. A platform hosts your brand; we supply the photography and video that goes on it. We deliver files you own outright, so they work anywhere.",
  },
  {
    q: "Do you lock me into a contract?",
    a: "No. Shoots are booked and paid per job. There is no subscription, no minimum term and nothing to cancel.",
  },
] as const;

/** Facts only: ours from this codebase, theirs from their public site. */
export const COMPARE_ROWS = [
  { label: "What it is", lp: "Marketing platform and software", jm: "Local photo and video studio" },
  { label: "Pricing", lp: "Not published — book a demo", jm: "Published; book online in minutes" },
  { label: "Commitment", lp: "Subscription plans", jm: "Per shoot, no contract" },
  { label: "Who shoots your listing", lp: "You arrange that separately", jm: "We do — that is the service" },
  { label: "Based", lp: "National, California", jm: "Tampa Bay and Washington, DC" },
  { label: "Website and CRM", lp: "Yes, core to the product", jm: "No — we do not build websites" },
  { label: "You own the files", lp: "Varies by plan", jm: "Yes, outright" },
] as const;
