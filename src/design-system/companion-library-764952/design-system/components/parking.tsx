import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Car, Bike } from "lucide-react";
import { cn } from "../lib/utils";
import { StatusPill, type StatusValue } from "./badge";

export type SlotStatus = "FREE" | "OCCUPIED";
export type SlotVehicleType = "CAR" | "BIKE";

export interface ParkingSlotData {
  slotNumber: string;
  vehicleType: SlotVehicleType;
  status: SlotStatus;
}

const slotVariants = cva(
  "group relative flex flex-col justify-between rounded-md border-b-4 p-2.5 text-left shadow-slot transition-all duration-500 ease-[var(--ease-smooth)] [transform:perspective(600px)_rotateX(8deg)] hover:[transform:perspective(600px)_rotateX(0deg)_translateY(-3px)]",
  {
    variants: {
      status: {
        FREE: "bg-slot-free border-slot-free-edge text-accent-ink",
        OCCUPIED: "bg-slot-occupied border-slot-occupied-edge text-ink-inverse",
      },
      size: { sm: "h-20 w-[4.25rem]", md: "h-28 w-20" },
    },
    defaultVariants: { status: "FREE", size: "md" },
  },
);

export interface ParkingSlotProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    Omit<VariantProps<typeof slotVariants>, "status">,
    ParkingSlotData {}

/** One parking bay with a raised 3D look. Renders a button so it can open details. */
export const ParkingSlot = React.forwardRef<HTMLButtonElement, ParkingSlotProps>(
  ({ slotNumber, vehicleType, status, size, className, ...props }, ref) => {
    const Icon = vehicleType === "BIKE" ? Bike : Car;
    return (
      <button
        ref={ref}
        type="button"
        aria-label={`Slot ${slotNumber}, ${vehicleType.toLowerCase()}, ${status.toLowerCase()}`}
        className={cn(slotVariants({ status, size }), className)}
        {...props}
      >
        <span className="text-xs font-semibold tabular-nums">{slotNumber}</span>
        <Icon
          aria-hidden
          className={cn("mx-auto size-6 transition-all duration-500", status === "FREE" ? "opacity-35" : "text-accent opacity-100")}
        />
        <span className={cn("text-[9px] font-semibold tracking-wide", status === "FREE" ? "text-accent-strong" : "text-accent")}>
          {status}
        </span>
      </button>
    );
  },
);
ParkingSlot.displayName = "ParkingSlot";

export interface ParkingGridProps extends React.HTMLAttributes<HTMLDivElement> {
  slots: ParkingSlotData[];
  onSlotClick?: (slot: ParkingSlotData) => void;
  size?: "sm" | "md";
}

/** Lot layout grouped by row letter (A, B, C…), with a drive lane between rows. */
export const ParkingGrid = React.forwardRef<HTMLDivElement, ParkingGridProps>(
  ({ slots, onSlotClick, size = "md", className, ...props }, ref) => {
    const rows = React.useMemo(() => {
      const m = new Map<string, ParkingSlotData[]>();
      [...slots].sort((a, b) => a.slotNumber.localeCompare(b.slotNumber)).forEach((s) => {
        const k = s.slotNumber.charAt(0);
        m.set(k, [...(m.get(k) ?? []), s]);
      });
      return [...m.entries()];
    }, [slots]);
    return (
      <div ref={ref} className={cn("overflow-x-auto rounded-lg border border-border bg-surface-sunken p-5", className)} {...props}>
        {rows.map(([row, list], i) => (
          <div key={row}>
            {i > 0 && (
              <div aria-hidden className="my-3 flex items-center gap-2">
                <div className="h-px flex-1 border-t-2 border-dashed border-border-strong" />
                <span className="text-[10px] uppercase tracking-widest text-ink-subtle">Drive lane</span>
                <div className="h-px flex-1 border-t-2 border-dashed border-border-strong" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="w-5 text-sm font-semibold text-ink-muted">{row}</span>
              <div className="flex gap-2">
                {list.map((s) => (
                  <ParkingSlot key={s.slotNumber} {...s} size={size} onClick={onSlotClick ? () => onSlotClick(s) : undefined} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  },
);
ParkingGrid.displayName = "ParkingGrid";

export interface OccupancyMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  occupied: number;
  total: number;
}

/** Horizontal occupancy bar with counts. */
export const OccupancyMeter = React.forwardRef<HTMLDivElement, OccupancyMeterProps>(
  ({ occupied, total, className, ...props }, ref) => {
    const pct = total ? Math.round((occupied / total) * 100) : 0;
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold tabular-nums text-ink">{pct}%</span>
          <span className="text-xs text-ink-muted">{occupied} of {total} occupied</span>
        </div>
        <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Occupancy" className="h-2.5 overflow-hidden rounded-full bg-slot-free shadow-[inset_0_1px_2px_rgb(0_0_0/0.06)]">
          <div className="h-full rounded-full bg-slot-occupied transition-[width] duration-700 ease-[var(--ease-smooth)]" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-slot-occupied" />Occupied</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-slot-free-edge" />Free</span>
        </div>
      </div>
    );
  },
);
OccupancyMeter.displayName = "OccupancyMeter";

export interface CustomerSearchResultProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  licensePlate: string;
  parkingStatus: Extract<StatusValue, "ACTIVE" | "COMPLETED">;
  duration: string;
  amountPaid: string;
  paymentStatus: Extract<StatusValue, "PAID" | "PENDING" | "FAILED">;
}

/** Compact result for the customer quick search (CUSTOMER → VEHICLE → SESSION → BILL → PAYMENT). */
export const CustomerSearchResult = React.forwardRef<HTMLDivElement, CustomerSearchResultProps>(
  ({ name, licensePlate, parkingStatus, duration, amountPaid, paymentStatus, className, ...props }, ref) => (
    <div ref={ref} className={cn("animate-fade-up rounded-lg border border-border bg-surface p-4 shadow-card", className)} {...props}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-semibold text-ink">{name}</p>
        <span className="rounded-sm border border-border-strong bg-canvas px-2 py-0.5 font-mono text-xs font-semibold tracking-wider text-ink">
          {licensePlate}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
        <div><dt className="text-xs text-ink-muted">Parking</dt><dd className="mt-1"><StatusPill status={parkingStatus} /></dd></div>
        <div><dt className="text-xs text-ink-muted">Duration</dt><dd className="mt-1 tabular-nums text-ink">{duration}</dd></div>
        <div><dt className="text-xs text-ink-muted">Amount paid</dt><dd className="mt-1 tabular-nums font-medium text-ink">{amountPaid}</dd></div>
        <div><dt className="text-xs text-ink-muted">Payment</dt><dd className="mt-1"><StatusPill status={paymentStatus} /></dd></div>
      </dl>
    </div>
  ),
);
CustomerSearchResult.displayName = "CustomerSearchResult";
