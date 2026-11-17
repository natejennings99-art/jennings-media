# Spots that still use a placeholder photo

Updated 2026-11-16. Our own footage in `public/media` replaced these:

| Where | Was | Now |
|---|---|---|
| Home / Services → **Lead Generation** card | Unsplash desk | `/media/work/jennings-ad-01.jpg` (our ad, the desk and monitors) |
| Home / Services → **Social Media** card | Unsplash confetti | `/media/video/silos-crowd.jpg` (the brewery event crowd) |
| Home / Services → **Brand Strategy** card | Unsplash architecture | `/media/photos/isaia-styling.jpg` (the Isaia store shoot) |
| Insights → **The first three seconds** | Unsplash film set | `/media/video/film.jpg` (the opening frame of our film) |

These 7 spots still show a stock (Unsplash) photo. Each one now loads a fixed file
from **`public/photos/`**. To replace one, save your photo into that folder with
**exactly the same file name** (JPG, about 2000 px wide, landscape). The current stock
photo is already there under that name, so nothing breaks until you swap it.

| Where it shows | File to replace | What would fit |
|---|---|---|
| Home / Services → **Meta & Google Ads** card | `public/photos/ads-card.jpg` | A screenshot of an ad you ran, or a phone showing one of our reels as an ad |
| Home / Services → **AI Agents** card | `public/photos/ai-agents-card.jpg` | A screenshot of the lead auto-reply or the chat agent working |
| Home / Services → **Websites & Funnels** card | `public/photos/websites-card.jpg` | **Done 2026-11-16:** laptop shot of tampamaidscleaning.com (raw screenshot: `public/media/work/tampa-maids-home.jpg`) |
| Home / Services → **SEO + Content** card | `public/photos/seo-card.jpg` | A Search Console graph, or a Tampa skyline drone still once you have one |
| Insights → **ROAS is a lagging indicator** | `public/photos/roas-article.jpg` | An ads screenshot (can be the same picture as the Ads card) |
| Insights → **Fewer campaigns, more systems** | `public/photos/fewer-campaigns-article.jpg` | You at a whiteboard or planning a shoot |
| Services → **Floor plans** | `public/photos/floor-plans.jpg` | A clean export of one of our floor plans. `video/jennings-ad.jpg` shows one, but it is portrait and mostly black, so it crops badly into a card |

The file names are set in `src/lib/content/photo-spots.ts`. The Floor plans photo is
the starting value; if a database is connected, Admin → Services can override it.
After swapping a file, redeploy so the new photo goes live.

Not live: `src/lib/content/samples.ts` (sample case studies for hotels, cafés,
gyms and skincare) also uses Unsplash. It only shows in development, or if
`SHOW_SAMPLE_CONTENT=true`.

All our footage is Northern Virginia / DC work so far. Once you've shot in
Tampa Bay, swap a Tampa drone still into the home hero and the real-estate
pages first.
