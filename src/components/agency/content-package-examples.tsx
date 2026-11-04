import Image from "next/image";
import { CONTENT_PACKAGE_EXAMPLES } from "@/lib/content/content-package";
import { AmbientVideo } from "@/components/experience/ambient-video";

/** Three real deliverables from our own shoots: a vertical reel and two edited photos. */
export function ContentPackageExamples() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {CONTENT_PACKAGE_EXAMPLES.map((e) => (
        <li key={e.src} className="group">
          <figure className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-900">
            <Image src={e.kind === "video" ? e.poster : e.src} alt={e.caption} fill sizes="(min-width:640px) 30vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            {e.kind === "video" && <AmbientVideo src={e.src} threshold={0.4} className="absolute inset-0 size-full object-cover" />}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-4 bottom-4">
              <p className="label text-accent-300">{e.title}</p>
              <p className="mt-1 text-[14px] leading-snug text-bone-50">{e.caption}</p>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
