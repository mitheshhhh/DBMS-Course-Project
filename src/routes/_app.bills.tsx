import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, DataTable, PageHeader, SearchField } from "@/design-system/companion-library-764952";
import { billsQuery, dateTime, errMsg, money } from "@/lib/api";

export const Route = createFileRoute("/_app/bills")({
  head: () => ({
    meta: [
      { title: "Bills — ParkSmart" },
      { name: "description", content: "Bills generated for parking sessions." },
      { property: "og:title", content: "Bills — ParkSmart" },
      { property: "og:description", content: "Bills generated for parking sessions." },
    ],
  }),
  component: BillsPage,
});

function BillsPage() {
  const q = useQuery(billsQuery);
  const [term, setTerm] = useState("");
  const t = term.trim();
  const rows = (q.data ?? []).filter((b) => !t || String(b.billId).includes(t) || String(b.sessionId).includes(t) || b.licensePlate?.toLowerCase().includes(t.toLowerCase()));
  return (
    <>
      <PageHeader title="Bills" description="Charges raised for each parking session." />
      <Card padding="none">
        <div className="p-4">
          <SearchField label="Search bills" placeholder="Bill ID, session ID or plate…" value={term} onChange={(e) => setTerm(e.target.value)} className="sm:w-80" />
        </div>
        <DataTable
          rows={rows} rowKey={(r) => r.billId} loading={q.isLoading} error={errMsg(q.error)} onRetry={() => q.refetch()}
          emptyTitle="No bills found"
          columns={[
            { key: "id", header: "Bill ID", cell: (r) => r.billId, sortValue: (r) => r.billId },
            { key: "session", header: "Session ID", cell: (r) => r.sessionId },
            { key: "info", header: "Bill information", cell: (r) => <span className="text-ink-muted">{[r.licensePlate, r.slotNumber, dateTime(r.billTime)].filter((x) => x && x !== "—").join(" · ") || "—"}</span> },
            { key: "amount", header: "Amount", align: "right", cell: (r) => money(r.amount), sortValue: (r) => r.amount },
          ]}
        />
      </Card>
    </>
  );
}
