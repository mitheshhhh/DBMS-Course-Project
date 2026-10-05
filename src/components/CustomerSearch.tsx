import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchField, Skeleton, EmptyState, ErrorState, StatusPill } from "@/design-system/companion-library-764952";
import { customerSearchQuery, duration, errMsg, money } from "@/lib/api";

export function CustomerSearch({ initial = "" }: { initial?: string }) {
  const [term, setTerm] = useState(initial);
  const q = useQuery(customerSearchQuery(term));
  const active = term.trim().length > 1;

  return (
    <div className="space-y-4">
      <SearchField label="Search customer by name" placeholder="e.g. Anjali Nair" value={term} onChange={(e) => setTerm(e.target.value)} />
      {active && q.isLoading && <Skeleton shape="block" className="h-16" />}
      {active && q.error && <ErrorState description={errMsg(q.error) ?? undefined} onRetry={() => q.refetch()} />}
      {active && q.data && q.data.length === 0 && <EmptyState title="No matching customer" description="Try a different name." />}
      {q.data && q.data.length > 0 && (
        <ul className="divide-y divide-border">
          {q.data.map((r, i) => (
            <li key={`${r.licensePlate}-${r.entryTime}-${i}`} className="grid animate-fade-up grid-cols-2 gap-3 py-3 text-sm sm:grid-cols-6">
              <Field label="Name" value={r.name} />
              <Field label="License plate" value={r.licensePlate} />
              <Field label="Parking status" value={<StatusPill status={r.parkingStatus} />} />
              <Field label="Duration" value={duration(r.entryTime, r.exitTime)} />
              <Field label="Amount paid" value={money(r.amountPaid)} />
              <Field label="Payment" value={r.paymentStatus ? <StatusPill status={r.paymentStatus} /> : "—"} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-ink-subtle">{label}</div>
      <div className="font-medium text-ink">{value}</div>
    </div>
  );
}
