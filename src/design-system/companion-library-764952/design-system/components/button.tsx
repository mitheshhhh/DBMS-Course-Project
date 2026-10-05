import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium rounded-md transition-all duration-200 ease-[var(--ease-smooth)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-ink text-ink-inverse shadow-card hover:bg-ink/90 hover:shadow-raised",
        accent: "bg-accent text-accent-ink shadow-xs hover:bg-accent/80",
        secondary: "bg-surface text-ink border border-border shadow-xs hover:border-border-strong hover:shadow-card",
        ghost: "text-ink-muted hover:bg-surface-sunken hover:text-ink",
        danger: "bg-danger-soft text-danger hover:bg-danger/15",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-5 text-sm",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/** Primary action control. Icon-only buttons (size="icon") need an aria-label. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
