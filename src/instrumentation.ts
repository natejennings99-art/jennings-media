/**
 * Runs once when the production server starts (i.e. once per Render deploy).
 * Tells IndexNow-enabled search engines (Bing, Yandex, Seznam, Naver…) that the
 * site's pages changed, so new and updated pages are crawled within hours.
 * Google ignores IndexNow; it reads the sitemap submitted in Search Console.
 */
const INDEXNOW_KEY = "c5fbcb7b9aaf15c78826b75e68c6801e"; // public by design: served at /<key>.txt
const HOST = "jennings-media.com";

async function pingIndexNow() {
  try {
    const sitemap = await fetch(`https://${HOST}/sitemap.xml`, { cache: "no-store" }).then((r) => r.text());
    const urlList = [...sitemap.matchAll(/<loc>(https:\/\/jennings-media\.com[^<]*)<\/loc>/g)].map((m) => m[1]);
    if (!urlList.length) return;
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`, urlList }),
    });
    console.log(`[indexnow] submitted ${urlList.length} URLs: HTTP ${res.status}`);
  } catch (error) {
    console.warn("[indexnow] ping failed", error);
  }
}

export async function register() {
  // Only the live Render instance, never local builds or previews.
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.RENDER !== "true") return;
  if (!(process.env.NEXT_PUBLIC_SITE_URL ?? "").includes(HOST)) return;
  // Wait until the new deploy is serving traffic, then ping once.
  setTimeout(() => void pingIndexNow(), 90_000).unref?.();
}
