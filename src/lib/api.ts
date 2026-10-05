import { queryOptions } from "@tanstack/react-query";

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:4000";

async function get<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`);
  } catch {
    throw new Error(`Can't reach the parking API at ${API_BASE}. Make sure the server is running.`);
  }
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text().catch(() => "")}`);
  return res.json() as Promise<T>;
}

export type Stats = { totalSlots: number; occupied: number; available: number; activeSessions: number; totalRevenue: number };
export type Slot = { slotId: number; slotNumber: string; vehicleType: "CAR" | "BIKE"; status: "FREE" | "OCCUPIED" };
export type Customer = { customerId: number; name: string; contact: string; email: string };
export type Vehicle = { vehicleId: number; customerId: number; customerName: string; licensePlate: string; vehicleType: string };
export type Session = { sessionId: number; vehicleId: number; licensePlate: string; slotNumber: string; entryTime: string; exitTime: string | null; status: "ACTIVE" | "COMPLETED" };
export type Bill = { billId: number; sessionId: number; amount: number; billTime: string | null; licensePlate: string | null; slotNumber: string | null };
export type Payment = { paymentId: number; billId: number; amountPaid: number; paymentStatus: "PAID" | "PENDING" | "FAILED"; paymentTime: string | null };
export type Activity = { id: string; kind: "entry" | "exit" | "payment"; title: string; meta: string; time: string };
export type CustomerSearchRow = {
  name: string; licensePlate: string; parkingStatus: "ACTIVE" | "COMPLETED";
  entryTime: string; exitTime: string | null; amountPaid: number | null; paymentStatus: "PAID" | "PENDING" | "FAILED" | null;
};
export type CustomerDetail = Customer & { vehicles: Vehicle[]; sessions: Session[] };

const live = { refetchInterval: 5000 };

export const statsQuery = queryOptions({ queryKey: ["stats"], queryFn: () => get<Stats>("/api/stats"), ...live });
export const slotsQuery = queryOptions({ queryKey: ["slots"], queryFn: () => get<Slot[]>("/api/slots"), ...live });
export const activityQuery = queryOptions({ queryKey: ["activity"], queryFn: () => get<Activity[]>("/api/activity"), ...live });
export const customersQuery = queryOptions({ queryKey: ["customers"], queryFn: () => get<Customer[]>("/api/customers") });
export const customerQuery = (id: number) =>
  queryOptions({ queryKey: ["customer", id], queryFn: () => get<CustomerDetail>(`/api/customers/${id}`) });
export const vehiclesQuery = queryOptions({ queryKey: ["vehicles"], queryFn: () => get<Vehicle[]>("/api/vehicles") });
export const sessionsQuery = queryOptions({ queryKey: ["sessions"], queryFn: () => get<Session[]>("/api/sessions") });
export const billsQuery = queryOptions({ queryKey: ["bills"], queryFn: () => get<Bill[]>("/api/bills") });
export const paymentsQuery = queryOptions({ queryKey: ["payments"], queryFn: () => get<Payment[]>("/api/payments") });
export const customerSearchQuery = (name: string) =>
  queryOptions({
    queryKey: ["customer-search", name],
    queryFn: () => get<CustomerSearchRow[]>(`/api/search/customer?name=${encodeURIComponent(name)}`),
    enabled: name.trim().length > 1,
  });

export const money = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);
export const dateTime = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
export function duration(entry: string, exit: string | null) {
  const ms = (exit ? new Date(exit).getTime() : Date.now()) - new Date(entry).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const m = Math.floor(ms / 60000);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}
export const errMsg = (e: unknown) => (e instanceof Error ? e.message : e ? String(e) : null);
