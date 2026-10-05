import * as React from "react";
import {
  LayoutDashboard, Users, Car, ParkingSquare, Timer, Receipt, CreditCard, type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** The seven standard sections of the parking console. */
export const parkingNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  { label: "Parking Slots", href: "/slots", icon: ParkingSquare },
  { label: "Parking Sessions", href: "/sessions", icon: Timer },
  { label: "Bills", href: "/bills", icon: Receipt },
  { label: "Payments", href: "/payments", icon: CreditCard },
];

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  items?: NavItem[];
  activeHref?: string;
  brand?: React.ReactNode;
  footer?: React.ReactNode;
  /** Render links with your router (e.g. TanStack <Link>). Defaults to <a>. */
  renderLink?: (item: NavItem, props: { className: string; children: React.ReactNode; "aria-current"?: "page" }) => React.ReactNode;
}

/** Primary navigation rail. */
export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ items = parkingNavItems, activeHref, brand, footer, renderLink, className, ...props }, ref) => (
    <aside ref={ref} className={cn("flex min-h-full w-60 shrink-0 self-stretch flex-col border-r border-border bg-surface", className)} {...props}>
      <div className="flex h-16 items-center px-5">
        {brand ?? (
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-md bg-ink text-sm font-bold text-accent shadow-raised">P</div>
            <span className="text-sm font-semibold text-ink">ParkSmart</span>
          </div>
        )}
      </div>
      <nav aria-label="Main" className="flex-1 space-y-0.5 px-3 py-2">
        {items.map((item) => {
          const active = item.href === activeHref;
          const Icon = item.icon;
          const cls = cn(
            "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
            active ? "bg-accent-soft font-medium text-accent-ink" : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
          );
          const children = (
            <>
              {active && <span aria-hidden className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent-strong" />}
              <Icon className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
              {item.label}
            </>
          );
          const linkProps = { className: cls, children, ...(active ? { "aria-current": "page" as const } : {}) };
          return (
            <React.Fragment key={item.href}>
              {renderLink ? renderLink(item, linkProps) : <a href={item.href} {...linkProps} />}
            </React.Fragment>
          );
        })}
      </nav>
      {footer && <div className="border-t border-border p-3">{footer}</div>}
    </aside>
  ),
);
Sidebar.displayName = "Sidebar";

export interface TopBarProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  search?: React.ReactNode;
  user?: { name: string; role?: string };
  leading?: React.ReactNode;
}

/** Sticky header with page title, search and admin area. */
export const TopBar = React.forwardRef<HTMLElement, TopBarProps>(
  ({ title, search, user, leading, className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn("sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-canvas/90 px-6 backdrop-blur-sm", className)}
      {...props}
    >
      {leading}
      <h1 className="text-base font-semibold text-ink">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        {search && <div className="hidden w-64 md:block">{search}</div>}
        {user && (
          <button type="button" className="flex items-center gap-2.5 rounded-md p-1 pr-2 hover:bg-surface-sunken">
            <span className="grid size-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-ink">
              {user.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-medium text-ink">{user.name}</span>
              {user.role && <span className="block text-[11px] text-ink-muted">{user.role}</span>}
            </span>
          </button>
        )}
      </div>
    </header>
  ),
);
TopBar.displayName = "TopBar";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

/** Section heading at the top of a page body. */
export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, actions, className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-6 flex flex-wrap items-end justify-between gap-4", className)} {...props}>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  ),
);
PageHeader.displayName = "PageHeader";
