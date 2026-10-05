import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, Inbox } from "lucide-react";
import { cn } from "../lib/utils";

const skeletonVariants = cva(
  "animate-shimmer bg-[linear-gradient(90deg,var(--color-surface-sunken)_0%,var(--color-canvas)_50%,var(--color-surface-sunken)_100%)] bg-[length:200%_100%]",
  { variants: { shape: { line: "h-3 rounded-sm", block: "rounded-md", circle: "rounded-full" } }, defaultVariants: { shape: "line" } },
);

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

/** Loading placeholder. Size it with className (e.g. w-24, h-20). */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(({ className, shape, ...props }, ref) => (
  <div ref={ref} aria-hidden className={cn(skeletonVariants({ shape }), className)} {...props} />
));
Skeleton.displayName = "Skeleton";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

/** Shown when a list or table has no records. */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, icon, action, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)} {...props}>
      <div className="mb-3 grid size-10 place-items-center rounded-md bg-surface-sunken text-ink-subtle [&_svg]:size-5">
        {icon ?? <Inbox />}
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";

export interface ErrorStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onRetry?: () => void;
}

/** Shown when data fails to load. */
export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ title = "Couldn't load data", description, onRetry, className, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)} {...props}>
      <div className="mb-3 grid size-10 place-items-center rounded-md bg-danger-soft text-danger">
        <AlertCircle className="size-5" />
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 text-sm font-medium text-accent-strong hover:underline">
          Try again
        </button>
      )}
    </div>
  ),
);
ErrorState.displayName = "ErrorState";
