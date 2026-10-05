import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, DataTable, FilterBar, PageHeader, StatusPill } from "@/design-system/companion-library-764952";
import { dateTime, errMsg, money, paymentsQuery } from "@/lib/api";

export const Route = createFileRoute("/_app/payments")({
  head: () => ({
    meta: [
      { title: "Payments — ParkSmart" },
      { name: "description", content: "Payment records and statuses for parking bills." },
      { property: "og:title", content: "Payments — ParkSmart" },
      { property: "og:description", content: "Payment records and statuses for parking bills." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const q = useQuery(paymentsQuery);
  const [status, setStatus] = useState("ALL");
  const rows = (q.data ?? []).filter((p) => status === "ALL" || p.paymentStatus === status);
  return (
    <>
      <PageHeader title="Payments" description="Received, pending and failed payments." />
      <Card padding="none">
        <div className="p-4">
          <FilterBar value={status} onChange={setStatus} options={[
            { label: "All", value: "ALL" }, { label: "Paid", value: "PAID" }, { label: "Pending", value: "PENDING" }, { label: "Failed", value: "FAILED" },
          ]} />
        </div>
        <DataTable
          rows={rows} rowKey={(r) => r.paymentId} loading={q.isLoading} error={errMsg(q.error)} onRetry={() => q.refetch()}
          emptyTitle="No payments found"
          columns={[
            { key: "id", header: "Payment ID", cell: (r) => r.paymentId, sortValue: (r) => r.paymentId },
            { key: "bill", header: "Bill ID", cell: (r) => r.billId },
            { key: "amount", header: "Amount paid", align: "right", cell: (r) => money(r.amountPaid), sortValue: (r) => r.amountPaid },
            { key: "status", header: "Status", cell: (r) => <StatusPill status={r.paymentStatus} /> },
            { key: "time", header: "Payment time", cell: (r) => dateTime(r.paymentTime), sortValue: (r) => r.paymentTime ?? "" },
          ]}
        />
      </Card>
    </>
  );
}
