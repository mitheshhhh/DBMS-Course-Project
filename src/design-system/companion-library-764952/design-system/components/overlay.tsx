import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

const dialogVariants = cva(
  "m-auto w-[calc(100%-2rem)] rounded-lg border border-border bg-surface p-0 text-ink shadow-overlay backdrop:bg-ink/25 open:animate-fade-up",
  { variants: { size: { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" } }, defaultVariants: { size: "md" } },
);

export interface DialogProps
  extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "title">,
    VariantProps<typeof dialogVariants> {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
}

/** Modal dialog built on native <dialog> (focus trap + Esc handled by the browser). */
export const Dialog = React.forwardRef<HTMLDialogElement, DialogProps>(
  ({ open, onClose, title, description, footer, size, className, children, ...props }, ref) => {
    const inner = React.useRef<HTMLDialogElement>(null);
    React.useImperativeHandle(ref, () => inner.current as HTMLDialogElement);
    React.useEffect(() => {
      const d = inner.current;
      if (!d) return;
      if (open && !d.open) d.showModal();
      if (!open && d.open) d.close();
    }, [open]);
    return (
      <dialog
        ref={inner}
        onClose={onClose}
        onClick={(e) => e.target === inner.current && onClose()}
        className={cn(dialogVariants({ size }), className)}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-sm p-1 text-ink-muted hover:bg-surface-sunken hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border bg-canvas px-5 py-3">{footer}</div>}
      </dialog>
    );
  },
);
Dialog.displayName = "Dialog";

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content"> {
  content: React.ReactNode;
  side?: "top" | "bottom";
}

/** Lightweight hover/focus tooltip. Wrap a focusable element. */
export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  ({ content, side = "top", className, children, ...props }, ref) => {
    const id = React.useId();
    return (
      <span ref={ref} className={cn("group/tt relative inline-flex", className)} aria-describedby={id} {...props}>
        {children}
        <span
          role="tooltip"
          id={id}
          className={cn(
            "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-sm bg-ink px-2 py-1 text-xs text-ink-inverse opacity-0 shadow-raised transition-opacity duration-150 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
          )}
        >
          {content}
        </span>
      </span>
    );
  },
);
Tooltip.displayName = "Tooltip";
