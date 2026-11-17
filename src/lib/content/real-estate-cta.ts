/** Real estate landing pages. The phone bar and the header button send these to /book instead of /contact. */
export const REAL_ESTATE_PATH = /^\/(real-estate|pricing|drone-real-estate-tampa|listing-video-tampa|real-estate-photography-cost-tampa|matterport-3d-tour-tampa|how-to-prepare-home-for-real-estate-photos-tampa|twilight-real-estate-photography-tampa|locations)(\/|$)/;

/** The big end-of-page button on real estate pages: book a shoot, with the free reel as the softer option. */
export const RE_BOOK_CTA = {
  href: "/book",
  label: "Book a shoot",
  secondary: { href: "/free-listing-reel", label: "Or get your first listing reel free" },
} as const;
