import * as React from "react";
import { cn } from "../lib/utils";

export interface AmbientBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Line grid opacity; keep very low. */
  intensity?: "faint" | "soft";
}

/** Very subtle, slowly drifting line grid. Place once behind the app shell. */
export const AmbientBackground = React.forwardRef<HTMLDivElement, AmbientBackgroundProps>(
  ({ intensity = "faint", className, ...props }, ref) => (
    <div ref={ref} aria-hidden className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)} {...props}>
      <div
        className={cn("absolute -inset-[200px] animate-drift", intensity === "faint" ? "opacity-[0.35]" : "opacity-60")}
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "120px 60px",
          maskImage: "radial-gradient(ellipse at 70% 0%, black 10%, transparent 65%)",
        }}
      />
    </div>
  ),
);
AmbientBackground.displayName = "AmbientBackground";
