import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Tampa SEO landing pages added from the fact-checked drafts. */
const PAGES = ["matterport-3d-tour-tampa", "how-to-prepare-home-for-real-estate-photos-tampa", "twilight-real-estate-photography-tampa"];

const ROOT = process.cwd();
const src = (p: string) => readFileSync(join(ROOT, p), "utf8");
const page = (slug: string) => src(`src/app/(marketing)/${slug}/page.tsx`);

function allSources(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? allSources(p) : /\.tsx?$/.test(f) ? [p] : [];
  });
}

test("SEO pages: canonical, FAQ schema, one H1, in the sitemap and on the real estate path list", async () => {
  const sitemap = src("src/app/sitemap.ts");
  const { REAL_ESTATE_PATH } = await import("@/lib/content/real-estate-cta");
  for (const slug of PAGES) {
    const s = page(slug);
    assert.match(s, new RegExp(`const PATH = "/${slug}"`), slug);
    assert.match(s, /alternates: \{ canonical: PATH \}/, `${slug} canonical`);
    assert.match(s, /faqSchema\(faq\)/, `${slug} FAQ schema`);
    assert.equal((s.match(/<PageIntro\b/g) ?? []).length, 1, `${slug} has one PageIntro (its only H1)`);
    assert.doesNotMatch(s, /as="h1"|<h1/, `${slug} adds no second H1`);
    assert.ok(sitemap.includes(`"/${slug}"`), `${slug} in sitemap`);
    assert.ok(REAL_ESTATE_PATH.test(`/${slug}`), `${slug} gets the real estate phone bar`);
  }
});

test("SEO pages: no online-checkout wording and no draft placeholders", () => {
  for (const slug of PAGES) {
    const s = page(slug);
    assert.doesNotMatch(s, /at checkout|pay online|\[(ADD|CONFIRM|CHECK)\b/i, slug);
  }
});

test("SEO pages: at least one other page links to each", () => {
  const files = allSources(join(ROOT, "src"));
  for (const slug of PAGES) {
    const own = join(ROOT, `src/app/(marketing)/${slug}/page.tsx`);
    const linked = files.some((f) => f !== own && !f.endsWith("sitemap.ts") && readFileSync(f, "utf8").includes(`href="/${slug}"`));
    assert.ok(linked, `${slug} has an internal link`);
  }
});
