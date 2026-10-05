import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { Skeleton } from "./feedback";

function useCountUp(target: number, duration = 700) {
  const [v, setV] = React.useState(target);
  const prev = React.useRef(0);
  React.useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      return;
    }
    const from = prev.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setV(from + (target - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

const iconVariants = cva("grid size-9 place-items-center rounded-md [&_svg]:size-4", {
  variants: {
    tone: {
      neutral: "bg-surface-sunken text-ink-muted",
      accent: "bg-accent-soft text-accent-strong",
      dark: "bg-slot-occupied text-accent",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface StatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, VariantProps<typeof iconVariants> {
  label: string;
  value: number;
  icon?: React.ReactNode;
  /** Format the animated number, e.g. currency. */
  format?: (n: number) => string;
  hint?: React.ReactNode;
  loading?: boolean;
}

/** Dashboard metric with an animated count. */
export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, icon, format = (n) => Math.round(n).toLocaleString(), hint, loading, tone, className, ...props }, ref) => {
    const n = useCountUp(value);
    return (
      <div
        ref={ref}
        className={cn(
          "animate-fade-up rounded-lg border border-border bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-raised",
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
          {icon && <div className={iconVariants({ tone })}>{icon}</div>}
        </div>
        {loading ? (
          <Skeleton className="mt-3 h-9 w-24" shape="block" />
        ) : (
          <p className="mt-2 text-metric tabular-nums tracking-tight text-ink">{format(n)}</p>
        )}
        {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      </div>
    );
  },
);
StatCard.displayName = "StatCard";
