import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const cardVariants = cva("rounded-lg border bg-surface transition-all duration-300 ease-[var(--ease-smooth)]", {
  variants: {
    variant: {
      default: "border-border shadow-card",
      raised: "border-border shadow-raised",
      interactive: "border-border shadow-card hover:-translate-y-0.5 hover:shadow-raised hover:border-border-strong",
      flat: "border-border shadow-none",
    },
    padding: { none: "", sm: "p-4", md: "p-5", lg: "p-6" },
  },
  defaultVariants: { variant: "default", padding: "md" },
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

/** Layered white surface for grouping content. */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, padding, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ variant, padding }), className)} {...props} />
));
Card.displayName = "Card";

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

/** Title row for a Card. */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, description, action, className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4 flex items-start justify-between gap-4", className)} {...props}>
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  ),
);
CardHeader.displayName = "CardHeader";
