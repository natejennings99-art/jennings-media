/**
 * /join — photographers and videographers applying to shoot with Jennings Media.
 * Plain constants (no zod) so the client form and the server schema share one source.
 */
export const DISCIPLINES = ["photo", "video", "both"] as const;
export type Discipline = (typeof DISCIPLINES)[number];
export const DISCIPLINE_LABELS: Record<Discipline, string> = { photo: "Photo", video: "Video", both: "Photo + video" };

export const AVAILABILITY_OPTIONS = ["Weekdays", "Evenings", "Weekends", "Short notice (same week)"] as const;

export const JOIN_LOOKING_FOR = [
  { title: "Real estate & architecture", body: "Interiors, twilight exteriors, drone. You know how to light a room and keep verticals straight." },
  { title: "Short-form video", body: "Vertical reels for restaurants, gyms, salons and brands. Gimbal-smooth, cut for sound-off viewing." },
  { title: "Events", body: "Client appreciation nights, team outings, launches. Candid, quick and comfortable in a crowd." },
];

export const JOIN_HOW_IT_WORKS = [
  { title: "Send your work", body: "The form takes two minutes. A link to your portfolio or Instagram is all we need to start." },
  { title: "A quick call", body: "If it's a fit, Nate calls to talk gear, rates and the kind of shoots you want more of." },
  { title: "A paid trial shoot", body: "One real job at your rate. Go well and you're on the list for shoots in your area." },
];

export const JOIN_DETAILS = [
  "Tampa Bay and the Washington, DC area first; other cities as the work comes up",
  "You bring your own gear and edit to our delivery specs, or hand off RAW footage",
  "Paid per shoot at the rate you set below",
  "Independent contractor, no exclusivity — keep your own clients",
];
