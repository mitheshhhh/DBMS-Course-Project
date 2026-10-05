import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

const fieldVariants = cva(
  "w-full rounded-md border border-border bg-surface text-ink placeholder:text-ink-subtle shadow-xs transition-colors duration-200 hover:border-border-strong focus-visible:outline-none focus-visible:border-accent-strong focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-50",
  {
    variants: { size: { sm: "h-8 px-2.5 text-xs", md: "h-9 px-3 text-sm", lg: "h-11 px-3.5 text-sm" } },
    defaultVariants: { size: "md" },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof fieldVariants> {}

/** Text input. Pair with a <label htmlFor> or aria-label. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, size, ...props }, ref) => (
  <input ref={ref} className={cn(fieldVariants({ size }), className)} {...props} />
));
Input.displayName = "Input";

export interface SearchFieldProps extends InputProps {
  /** Accessible name; defaults to "Search". */
  label?: string;
}

/** Input with a leading search icon. */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, label = "Search", size, ...props }, ref) => (
    <div className={cn("relative", className)}>
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
      <input ref={ref} type="search" aria-label={label} className={cn(fieldVariants({ size }), "pl-9")} {...props} />
    </div>
  ),
);
SearchField.displayName = "SearchField";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof fieldVariants> {}

/** Native select styled to the system. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size, children, ...props }, ref) => (
    <div className={cn("relative", className)}>
      <select ref={ref} className={cn(fieldVariants({ size }), "appearance-none pr-8")} {...props}>
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
    </div>
  ),
);
Select.displayName = "Select";
