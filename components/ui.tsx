import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------- Button ---------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "soft" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-5 py-2.5 text-[15px]",
        variant === "primary" &&
          "bg-sage text-white shadow-warm hover:bg-sage-dark hover:-translate-y-px active:translate-y-0",
        variant === "soft" &&
          "bg-sage-soft text-sage-dark hover:bg-[#dfe7d3] hover:-translate-y-px",
        variant === "ghost" &&
          "text-muted hover:text-ink hover:bg-black/5",
        variant === "danger" &&
          "bg-[#f6e3dc] text-[#a05a44] hover:bg-[#f0d5c9]",
        className,
      )}
      {...props}
    />
  );
}

/* ---------- TextInput / TextArea ---------- */

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className, ...props }: TextInputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink",
        "placeholder:text-muted/70 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/25",
        "transition-all duration-150",
        className,
      )}
      {...props}
    />
  );
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink",
        "placeholder:text-muted/70 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/25",
        "transition-all duration-150 resize-y min-h-24",
        className,
      )}
      {...props}
    />
  );
}

/* ---------- Field label ---------- */

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-ink/80">
      {children}
    </label>
  );
}

/* ---------- Modal ---------- */

export function Modal({
  open,
  onClose,
  children,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <button
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-ink/35 backdrop-blur-[2px] cursor-pointer"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-surface p-6 shadow-lift animate-fade-up max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

/* ---------- Logo ---------- */

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-2xl font-semibold tracking-tight text-ink",
        className,
      )}
    >
      Geser
      <span className="text-gold">.</span>
    </span>
  );
}

/* ---------- Empty state ---------- */

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-soft text-2xl">
        <span aria-hidden="true">🍃</span>
      </div>
      <p className="font-display text-lg font-medium text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-sm text-muted">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
