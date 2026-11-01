import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-[transform,background-color,box-shadow,color] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: "bg-fill text-on-fill hover:bg-fill-hover shadow-[var(--shadow-border)]",
        pine: "bg-band text-on-fill hover:bg-band-deep",
        emergency: "bg-fill-caution text-on-fill hover:brightness-110",
        outline:
          "bg-card text-body shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
        ghost: "bg-transparent text-muted hover:bg-inset hover:text-body",
        call: "bg-fill text-on-fill hover:bg-fill-hover",
        danger: "bg-fill-critical text-on-fill",
      },
      size: {
        sm: "min-h-11 px-3.5 text-sm rounded-lg",
        md: "min-h-12 px-4 text-base rounded-xl",
        lg: "min-h-14 px-5 text-base rounded-2xl",
        icon: "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
