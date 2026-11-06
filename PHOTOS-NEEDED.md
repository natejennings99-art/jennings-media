# Spots that still use a placeholder photo

Updated 2026-11-06. Our own footage in `public/media` replaced these:

| Where | Was | Now |
|---|---|---|
| Home / Services → **Lead Generation** card | Unsplash desk | `/media/work/jennings-ad-01.jpg` (our ad, the desk and monitors) |
| Home / Services → **Social Media** card | Unsplash confetti | `/media/video/silos-crowd.jpg` (the brewery event crowd) |
| Home / Services → **Brand Strategy** card | Unsplash architecture | `/media/photos/isaia-styling.jpg` (the Isaia store shoot) |
| Insights → **The first three seconds** | Unsplash film set | `/media/video/film.jpg` (the opening frame of our film) |

These are still Unsplash, because nothing in our footage shows the subject.
Each one needs a real photo or a screenshot of real work:

| Where it shows | Image key (`src/lib/content/…`) | What would fit |
|---|---|---|
| Home / Services → **Meta & Google Ads** card | `agency.ts` → `A.earthNight` | A screenshot of an ad you ran, or a phone showing one of our reels as an ad |
| Home / Services → **AI Agents** card | `agency.ts` → `A.circuit` | A screenshot of the lead auto-reply or the chat agent working |
| Home / Services → **Websites & Funnels** card | `agency.ts` → `A.retroTech` | A laptop shot of tampamaidscleaning.com or jennings-media.com |
| Home / Services → **SEO + Content** card | `agency.ts` → `A.towersUp` | A Search Console graph, or a Tampa skyline drone still once you have one |
| Insights → **ROAS is a lagging indicator** | `agency.ts` → `A.earthNight` | The same ads screenshot as above |
| Insights → **Fewer campaigns, more systems** | `agency.ts` → `A.teamWhiteboard` | You at a whiteboard or planning a shoot |
| Services → **Floor plans** | `images.ts` → `IMAGES.blueprint` | A clean export of one of our floor plans. `video/jennings-ad.jpg` shows one, but it is portrait and mostly black, so it crops badly into a card |

Not live: `src/lib/content/samples.ts` (sample case studies for hotels, cafés,
gyms and skincare) also uses Unsplash. It only shows in development, or if
`SHOW_SAMPLE_CONTENT=true`.

All our footage is Northern Virginia / DC work so far. Once you've shot in
Tampa Bay, swap a Tampa drone still into the home hero and the real-estate
pages first.
