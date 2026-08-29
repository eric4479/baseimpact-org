import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full min-h-12 rounded-xl bg-paper-raised px-3.5 text-base text-ink shadow-[var(--shadow-border)] placeholder:text-ink-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function SelectField({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, "min-h-28 py-3", className)} {...props} />;
}

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink-soft">
      {children}
    </label>
  );
}
