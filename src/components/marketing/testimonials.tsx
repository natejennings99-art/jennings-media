import { Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { Avatar } from "@/components/ui/misc";
import { Marquee } from "./marquee";

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="surface mx-2 flex w-[20rem] shrink-0 flex-col justify-between rounded-[26px] p-6 sm:w-[25rem] sm:p-7">
      <div>
        {t.rating ? (
          <div className="flex gap-0.5 text-gold-300" aria-label={`${t.rating} out of 5 stars`}>
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </div>
        ) : null}
        <blockquote className="mt-4 text-[15.5px] leading-relaxed text-bone-100">&ldquo;{t.quote}&rdquo;</blockquote>
      </div>
      <figcaption className="mt-6 flex items-center gap-3">
        <Avatar name={t.author_name} src={t.avatar_url} size={40} />
        <div>
          <p className="text-sm font-medium text-bone-50">{t.author_name}</p>
          <p className="text-[12.5px] text-mist-400">{[t.author_title, t.company].filter(Boolean).join(", ")}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  const half = Math.ceil(items.length / 2);
  const rowA = items.length > 3 ? items.slice(0, half) : items;
  const rowB = items.length > 3 ? items.slice(half) : [];
  return (
    <div className="space-y-4">
      <Marquee duration={60}>
        {rowA.map((t) => (
          <TestimonialCard key={t.id} t={t} />
        ))}
      </Marquee>
      {rowB.length > 0 && (
        <Marquee duration={70} reverse>
          {rowB.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </Marquee>
      )}
    </div>
  );
}
