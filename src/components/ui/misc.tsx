import type { ReactNode } from "react";
import { cn, initials } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow inline-flex items-center gap-2.5", className)}>
      <span className="size-1.5 rounded-full bg-gold-300 shadow-[0_0_12px_rgb(230_201_152/0.8)]" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  as: Tag = "h2",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow className={cn("mb-5", align === "center" && "justify-center")}>{eyebrow}</Eyebrow>}
      <Tag className="text-balance text-[2.35rem] leading-[1.02] font-medium tracking-[-0.045em] text-bone-50 sm:text-5xl lg:text-6xl">
        {title}
      </Tag>
      {description && (
        <p className={cn("mt-5 max-w-2xl text-pretty text-base leading-relaxed text-mist-400 sm:text-lg", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}

/** Italic serif accent used inside headlines. */
export function Accent({ children, className }: { children: ReactNode; className?: string }) {
  return <em className={cn("font-serif font-normal italic tracking-[-0.02em] text-gold-200", className)}>{children}</em>;
}

export function Avatar({ name, src, size = 40, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-ink-600 to-ink-800 font-medium text-gold-200",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="absolute inset-0 size-full object-cover" />
      ) : (
        initials(name) || "?"
      )}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 px-6 py-14 text-center", className)}>
      {icon && <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-gold-300">{icon}</div>}
      <p className="text-[15px] font-medium text-bone-100">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-mist-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-white/15 bg-white/5 px-1 font-mono text-[10px] text-mist-300">
      {children}
    </kbd>
  );
}

export function Stat({ label, value, sub, className }: { label: ReactNode; value: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={cn("surface rounded-2xl p-5", className)}>
      <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-mist-500">{label}</p>
      <p className="mt-3 text-3xl font-medium tracking-[-0.03em] text-bone-50 tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-[13px] text-mist-400">{sub}</p>}
    </div>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-8 place-items-center rounded-[10px] bg-bone-50 text-ink-950 shadow-[0_0_30px_-6px_rgb(230_201_152/0.7)]">
        <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden>
          <path d="M14.5 3v11.2c0 3.2-2.1 5.3-5.2 5.3-1.9 0-3.4-.8-4.3-2.2l2.2-1.7c.5.8 1.2 1.3 2.1 1.3 1.4 0 2.2-.9 2.2-2.8V3h3Z" fill="currentColor" />
          <circle cx="19" cy="17.6" r="2" fill="#c29555" />
        </svg>
      </span>
      {!compact && (
        <span className="text-[17px] font-semibold tracking-[-0.03em] text-bone-50">
          Jennings<span className="font-serif text-[19px] font-normal italic text-gold-200"> Media</span>
        </span>
      )}
    </span>
  );
}
