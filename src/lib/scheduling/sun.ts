/**
 * Sunset time for a date and location (NOAA "Almanac for Computers" algorithm,
 * accurate to ~1–2 minutes). Used to schedule twilight shoots automatically.
 */
const RAD = Math.PI / 180;
const sin = (d: number) => Math.sin(d * RAD);
const cos = (d: number) => Math.cos(d * RAD);
const tan = (d: number) => Math.tan(d * RAD);
const norm = (v: number, max: number) => ((v % max) + max) % max;

export function sunsetUtc(ymd: string, latitude: number, longitude: number): Date | null {
  const [y, m, d] = ymd.split("-").map(Number);
  const dayOfYear = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000);
  const lngHour = longitude / 15;
  const t = dayOfYear + (18 - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  const L = norm(M + 1.916 * sin(M) + 0.02 * sin(2 * M) + 282.634, 360);
  let RA = norm(Math.atan(0.91764 * tan(L)) / RAD, 360);
  RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90;
  RA /= 15;
  const sinDec = 0.39782 * sin(L);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (cos(90.833) - sinDec * sin(latitude)) / (cosDec * cos(latitude));
  if (cosH > 1 || cosH < -1) return null;
  const H = Math.acos(cosH) / RAD / 15;
  const T = norm(H + RA - 0.06571 * t - 6.622, 24);
  const ut = T - lngHour;
  return new Date(Date.UTC(y, m - 1, d) + ut * 3600000);
}
