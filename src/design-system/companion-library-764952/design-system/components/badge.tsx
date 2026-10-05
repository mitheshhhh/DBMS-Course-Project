import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-surface-sunken text-ink-muted",
        accent: "bg-accent-soft text-accent-ink",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
        solid: "bg-ink text-ink-inverse",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/** Small label for categories and metadata. */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
));
Badge.displayName = "Badge";

export type StatusValue = "ACTIVE" | "COMPLETED" | "PAID" | "PENDING" | "FAILED" | "FREE" | "OCCUPIED";

const statusMap: Record<StatusValue, { variant: NonNullable<BadgeProps["variant"]>; dot: string }> = {
  ACTIVE: { variant: "accent", dot: "bg-accent-strong animate-pulse" },
  COMPLETED: { variant: "neutral", dot: "bg-ink-subtle" },
  PAID: { variant: "success", dot: "bg-success" },
  PENDING: { variant: "warning", dot: "bg-warning" },
  FAILED: { variant: "danger", dot: "bg-danger" },
  FREE: { variant: "success", dot: "bg-success" },
  OCCUPIED: { variant: "solid", dot: "bg-accent" },
};

export interface StatusPillProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Database status value; casing is normalised. */
  status: StatusValue | Lowercase<StatusValue>;
}

/** Status indicator for sessions, payments and slots. */
export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(({ status, className, ...props }, ref) => {
  const key = status.toUpperCase() as StatusValue;
  const s = statusMap[key] ?? statusMap.COMPLETED;
  return (
    <span ref={ref} className={cn(badgeVariants({ variant: s.variant }), "rounded-full px-2.5", className)} {...props}>
      <span aria-hidden className={cn("size-1.5 rounded-full", s.dot)} />
      {key.charAt(0) + key.slice(1).toLowerCase()}
    </span>
  );
});
StatusPill.displayName = "StatusPill";
