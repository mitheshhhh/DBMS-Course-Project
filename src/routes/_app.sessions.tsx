import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, CheckCircle } from "lucide-react";
import { Button, Card, DataTable, Dialog, FilterBar, PageHeader, SearchField, Select, StatusPill } from "@/design-system/companion-library-764952";
import { API_BASE, dateTime, errMsg, sessionsQuery, slotsQuery, vehiclesQuery } from "@/lib/api";

export const Route = createFileRoute("/_app/sessions")({
  head: () => ({
    meta: [
      { title: "Parking Sessions — ParkSmart" },
      { name: "description", content: "Active and completed parking sessions." },
      { property: "og:title", content: "Parking Sessions — ParkSmart" },
      { property: "og:description", content: "Active and completed parking sessions." },
    ],
  }),
  component: SessionsPage,
});

function SessionsPage() {
  const q = useQuery(sessionsQuery);
  const [status, setStatus] = useState("ALL");
  const [term, setTerm] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [completeSession, setCompleteSession] = useState<any>(null);
  const t = term.trim().toLowerCase();
  const rows = (q.data ?? []).filter(
    (s) => (status === "ALL" || s.status === status) && (!t || [s.licensePlate, s.slotNumber].some((x) => x?.toLowerCase().includes(t))),
  );
  return (
    <>
      <PageHeader title="Parking Sessions" description="Every entry and exit recorded in the system." />
      <Card padding="none">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchField label="Search sessions" placeholder="Plate or slot…" value={term} onChange={(e) => setTerm(e.target.value)} className="sm:w-80" />
            <FilterBar value={status} onChange={setStatus} options={[{ label: "All", value: "ALL" }, { label: "Active", value: "ACTIVE" }, { label: "Completed", value: "COMPLETED" }]} />
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="size-4" />Start Parking</Button>
        </div>
        <DataTable
          rows={rows} rowKey={(r) => r.sessionId} loading={q.isLoading} error={errMsg(q.error)} onRetry={() => q.refetch()}
          emptyTitle="No sessions found"
          columns={[
            { key: "id", header: "Session ID", cell: (r) => r.sessionId, sortValue: (r) => r.sessionId },
            { key: "vehicle", header: "Vehicle", cell: (r) => <span className="font-medium">{r.licensePlate}</span> },
            { key: "slot", header: "Slot", cell: (r) => r.slotNumber, sortValue: (r) => r.slotNumber },
            { key: "entry", header: "Entry time", cell: (r) => dateTime(r.entryTime), sortValue: (r) => r.entryTime },
            { key: "exit", header: "Exit time", cell: (r) => dateTime(r.exitTime) },
            { key: "status", header: "Status", cell: (r) => <StatusPill status={r.status} /> },
            { key: "actions", header: "Actions", cell: (r) => (
              r.status === "ACTIVE" ? (
                <Button size="sm" variant="ghost" onClick={() => setCompleteSession(r)}><CheckCircle className="size-3" />Complete</Button>
              ) : null
            )}
          ]}
        />
      </Card>
      <StartParkingDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <CompleteSessionDialog session={completeSession} onClose={() => setCompleteSession(null)} />
    </>
  );
}

// Start Parking Dialog
function StartParkingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const vehiclesQ = useQuery(vehiclesQuery);
  const slotsQ = useQuery(slotsQuery);
  const [vehicleId, setVehicleId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [error, setError] = useState("");

  const freeSlots = (slotsQ.data ?? []).filter(s => s.status === "FREE");

  const mutation = useMutation({
    mutationFn: async (data: { vehicleId: number; slotId: number }) => {
      const res = await fetch(`${API_BASE}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to start parking session");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setVehicleId("");
      setSlotId("");
      setError("");
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !slotId) {
      setError("Vehicle and parking slot are required");
      return;
    }
    mutation.mutate({ vehicleId: Number(vehicleId), slotId: Number(slotId) });
  };

  return (
    <Dialog open={open} onClose={onClose} title="Start Parking Session" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Vehicle *</label>
          <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="w-full">
            <option value="">Select vehicle...</option>
            {(vehiclesQ.data ?? []).map((v) => (
              <option key={v.vehicleId} value={v.vehicleId}>{v.licensePlate} ({v.customerName})</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Parking Slot *</label>
          <Select value={slotId} onChange={(e) => setSlotId(e.target.value)} className="w-full">
            <option value="">Select available slot...</option>
            {freeSlots.map((s) => (
              <option key={s.slotId} value={s.slotId}>{s.slotNumber} ({s.vehicleType})</option>
            ))}
          </Select>
          {freeSlots.length === 0 && (
            <p className="mt-1 text-sm text-red-600">No free slots available</p>
          )}
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || freeSlots.length === 0}>
            {mutation.isPending ? "Starting..." : "Start Parking"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// Complete Session Dialog
function CompleteSessionDialog({ session, onClose }: { session: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/api/sessions/${session!.sessionId}`, {
        method: "PUT",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to complete session");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      setError("");
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  if (!session) return null;

  return (
    <Dialog open={!!session} onClose={onClose} title="Complete Parking Session" size="sm">
      <div className="space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        <p className="text-ink">
          Complete parking session for <strong>{session.licensePlate}</strong> in slot <strong>{session.slotNumber}</strong>?
        </p>
        <div className="text-sm text-ink-muted space-y-1">
          <p>• Exit time will be recorded</p>
          <p>• Parking slot will become FREE</p>
          <p>• Bill will be generated based on duration</p>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Completing..." : "Complete Session"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
