import Link from "next/link";
import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition-[background-color,box-shadow,color,border-color,transform,opacity] duration-300 ease-(--ease-expo) active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45";

const variants = {
  primary:
    "bg-gold-300 text-ink-950 shadow-[inset_0_1px_0_rgb(255_255_255/0.55),0_12px_40px_-14px_rgb(216_177_116/0.75)] hover:bg-gold-200 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_18px_50px_-12px_rgb(216_177_116/0.85)]",
  light: "bg-bone-50 text-ink-950 hover:bg-white shadow-[0_10px_30px_-12px_rgb(255_255_255/0.35)]",
  secondary: "glass text-bone-50 hover:bg-white/10 hover:border-white/20",
  outline: "border border-white/15 text-bone-50 hover:border-white/30 hover:bg-white/[0.06]",
  ghost: "text-mist-300 hover:bg-white/[0.06] hover:text-bone-50",
  danger: "border border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20",
} as const;

const sizes = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[15px]",
  xl: "h-14 px-8 text-base sm:h-15",
  icon: "h-10 w-10",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({ variant, size, loading, className, children, disabled, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonStyles({ variant, size, className })} {...props} />;
}
