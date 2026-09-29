import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputBase =
  "w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-base text-bone-50 placeholder:text-mist-500 transition-[border-color,box-shadow,background-color] duration-200 hover:border-white/20 focus:border-gold-300/60 focus:bg-white/[0.05] focus:outline-none focus:ring-4 focus:ring-gold-300/10 disabled:opacity-50 sm:text-[15px] aria-[invalid=true]:border-red-400/60";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputBase, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputBase, "min-h-28 resize-y py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(inputBase, "h-12 cursor-pointer appearance-none pr-10 [&>option]:bg-ink-800", className)}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-mist-400"
      >
        <path fill="currentColor" d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
      </svg>
    </div>
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("mb-2 block text-[13px] font-medium text-mist-300", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
  className,
}: {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {optional && <span className="ml-1.5 font-normal text-mist-500">Optional</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-[13px] text-red-300" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-mist-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Checkbox({ label, description, className, ...props }: ComponentProps<"input"> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label className={cn("group flex cursor-pointer items-start gap-3", className)}>
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input type="checkbox" className="peer absolute inset-0 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 transition checked:border-gold-300 checked:bg-gold-300" {...props} />
        <svg viewBox="0 0 16 16" className="pointer-events-none relative size-3.5 text-ink-950 opacity-0 transition peer-checked:opacity-100" aria-hidden>
          <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-sm leading-snug text-mist-300">
        <span className="text-bone-100">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] text-mist-500">{description}</span>}
      </span>
    </label>
  );
}

export function Switch({ checked, onChange, label, disabled, name }: { checked: boolean; onChange?: (value: boolean) => void; label?: string; disabled?: boolean; name?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-300 disabled:opacity-50",
        checked ? "border-gold-300 bg-gold-300" : "border-white/15 bg-white/10"
      )}
    >
      {name && <input type="hidden" name={name} value={checked ? "true" : "false"} />}
      <span
        className={cn(
          "inline-block size-4.5 rounded-full shadow transition-transform duration-300 ease-(--ease-spring)",
          checked ? "translate-x-5.5 bg-ink-950" : "translate-x-0.5 bg-bone-100"
        )}
      />
    </button>
  );
}
