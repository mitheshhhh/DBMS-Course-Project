import * as React from "react";
import { LogIn, LogOut, CreditCard } from "lucide-react";
import { cn } from "../lib/utils";

export type ActivityKind = "entry" | "exit" | "payment";

export interface ActivityItem {
  id: string | number;
  kind: ActivityKind;
  title: React.ReactNode;
  meta?: React.ReactNode;
  time: React.ReactNode;
}

export interface ActivityListProps extends React.HTMLAttributes<HTMLUListElement> {
  items: ActivityItem[];
}

const icons: Record<ActivityKind, { Icon: typeof LogIn; cls: string }> = {
  entry: { Icon: LogIn, cls: "bg-accent-soft text-accent-strong" },
  exit: { Icon: LogOut, cls: "bg-surface-sunken text-ink-muted" },
  payment: { Icon: CreditCard, cls: "bg-success-soft text-success" },
};

/** Timeline of recent entries, exits and payments. */
export const ActivityList = React.forwardRef<HTMLUListElement, ActivityListProps>(({ items, className, ...props }, ref) => (
  <ul ref={ref} className={cn("divide-y divide-border", className)} {...props}>
    {items.map((it, i) => {
      const { Icon, cls } = icons[it.kind];
      return (
        <li key={it.id} style={{ animationDelay: `${i * 40}ms` }} className="flex animate-fade-up items-center gap-3 py-3">
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-md", cls)}><Icon className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{it.title}</p>
            {it.meta && <p className="truncate text-xs text-ink-muted">{it.meta}</p>}
          </div>
          <span className="shrink-0 text-xs tabular-nums text-ink-subtle">{it.time}</span>
        </li>
      );
    })}
  </ul>
));
ActivityList.displayName = "ActivityList";
