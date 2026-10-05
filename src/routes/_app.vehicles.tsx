import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Badge, Button, Card, DataTable, Dialog, FilterBar, PageHeader, SearchField, Select } from "@/design-system/companion-library-764952";
import { API_BASE, customersQuery, errMsg, vehiclesQuery } from "@/lib/api";

export const Route = createFileRoute("/_app/vehicles")({
  head: () => ({
    meta: [
      { title: "Vehicles — ParkSmart" },
      { name: "description", content: "All registered vehicles and their owners." },
      { property: "og:title", content: "Vehicles — ParkSmart" },
      { property: "og:description", content: "All registered vehicles and their owners." },
    ],
  }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const q = useQuery(vehiclesQuery);
  const [term, setTerm] = useState("");
  const [type, setType] = useState("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<any>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<any>(null);
  const t = term.trim().toLowerCase();
  const rows = (q.data ?? []).filter(
    (v) => (type === "ALL" || v.vehicleType?.toUpperCase() === type) &&
      (!t || [v.licensePlate, v.customerName].some((x) => x?.toLowerCase().includes(t))),
  );
  return (
    <>
      <PageHeader title="Vehicles" description="Registered vehicles linked to customers." />
      <Card padding="none">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchField label="Search vehicles" placeholder="Plate or customer…" value={term} onChange={(e) => setTerm(e.target.value)} className="sm:w-80" />
            <FilterBar value={type} onChange={setType} options={[{ label: "All", value: "ALL" }, { label: "Car", value: "CAR" }, { label: "Bike", value: "BIKE" }]} />
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="size-4" />Add Vehicle</Button>
        </div>
        <DataTable
          rows={rows} rowKey={(r) => r.vehicleId} loading={q.isLoading} error={errMsg(q.error)} onRetry={() => q.refetch()}
          emptyTitle="No vehicles found"
          columns={[
            { key: "id", header: "Vehicle ID", cell: (r) => r.vehicleId, sortValue: (r) => r.vehicleId },
            { key: "customer", header: "Customer", cell: (r) => r.customerName, sortValue: (r) => r.customerName },
            { key: "plate", header: "License plate", cell: (r) => <span className="font-medium">{r.licensePlate}</span> },
            { key: "type", header: "Type", cell: (r) => <Badge>{r.vehicleType}</Badge> },
            { key: "actions", header: "Actions", cell: (r) => (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditVehicle(r)}><Edit className="size-3" />Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteVehicle(r)}><Trash2 className="size-3" />Delete</Button>
              </div>
            )}
          ]}
        />
      </Card>
      <AddVehicleDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <EditVehicleDialog vehicle={editVehicle} onClose={() => setEditVehicle(null)} />
      <DeleteVehicleDialog vehicle={deleteVehicle} onClose={() => setDeleteVehicle(null)} />
    </>
  );
}

// Add Vehicle Dialog
function AddVehicleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const customersQ = useQuery(customersQuery);
  const [customerId, setCustomerId] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState("CAR");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: { customerId: number; licensePlate: string; vehicleType: string }) => {
      const res = await fetch(`${API_BASE}/api/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add vehicle");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setCustomerId("");
      setLicensePlate("");
      setVehicleType("CAR");
      setError("");
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !licensePlate.trim()) {
      setError("Customer and license plate are required");
      return;
    }
    mutation.mutate({ customerId: Number(customerId), licensePlate: licensePlate.trim().toUpperCase(), vehicleType });
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add New Vehicle" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Customer *</label>
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full">
            <option value="">Select customer...</option>
            {(customersQ.data ?? []).map((c) => (
              <option key={c.customerId} value={c.customerId}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">License Plate *</label>
          <input
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-ink uppercase focus:border-accent focus:outline-none"
            placeholder="e.g., TS09AB1234"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Vehicle Type *</label>
          <Select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full">
            <option value="CAR">Car</option>
            <option value="BIKE">Bike</option>
          </Select>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Adding..." : "Add Vehicle"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// Edit Vehicle Dialog
function EditVehicleDialog({ vehicle, onClose }: { vehicle: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const customersQ = useQuery(customersQuery);
  const [customerId, setCustomerId] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState("CAR");
  const [error, setError] = useState("");

  useState(() => {
    if (vehicle) {
      setCustomerId(String(vehicle.customerId));
      setLicensePlate(vehicle.licensePlate);
      setVehicleType(vehicle.vehicleType);
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: { customerId?: number; licensePlate?: string; vehicleType?: string }) => {
      const res = await fetch(`${API_BASE}/api/vehicles/${vehicle!.vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update vehicle");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setError("");
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ 
      customerId: Number(customerId), 
      licensePlate: licensePlate.trim().toUpperCase(), 
      vehicleType 
    });
  };

  if (!vehicle) return null;

  return (
    <Dialog open={!!vehicle} onClose={onClose} title="Edit Vehicle" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Customer *</label>
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full">
            <option value="">Select customer...</option>
            {(customersQ.data ?? []).map((c) => (
              <option key={c.customerId} value={c.customerId}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">License Plate *</label>
          <input
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-ink uppercase focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Vehicle Type *</label>
          <Select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full">
            <option value="CAR">Car</option>
            <option value="BIKE">Bike</option>
          </Select>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Updating..." : "Update Vehicle"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// Delete Vehicle Dialog
function DeleteVehicleDialog({ vehicle, onClose }: { vehicle: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/api/vehicles/${vehicle!.vehicleId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete vehicle");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setError("");
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  if (!vehicle) return null;

  return (
    <Dialog open={!!vehicle} onClose={onClose} title="Delete Vehicle" size="sm">
      <div className="space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        <p className="text-ink">
          Are you sure you want to delete vehicle <strong>{vehicle.licensePlate}</strong>?
        </p>
        <p className="text-sm text-ink-muted">
          This action cannot be undone. If this vehicle has related parking sessions, the deletion may fail.
        </p>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="bg-red-600 hover:bg-red-700">
            {mutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
