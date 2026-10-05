import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button, Card, DataTable, Dialog, ErrorState, PageHeader, SearchField, Select, Skeleton, StatusPill } from "@/design-system/companion-library-764952";
import { API_BASE, customerQuery, customersQuery, dateTime, errMsg, type Customer } from "@/lib/api";

export const Route = createFileRoute("/_app/customers")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Customers — ParkSmart" },
      { name: "description", content: "Search and review all parking customers." },
      { property: "og:title", content: "Customers — ParkSmart" },
      { property: "og:description", content: "Search and review all parking customers." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { q: initial } = Route.useSearch();
  const query = useQuery(customersQuery);
  const [term, setTerm] = useState(initial ?? "");
  const [field, setField] = useState("all");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial) { setLastInitial(initial); setTerm(initial ?? ""); }

  const t = term.trim().toLowerCase();
  const rows = (query.data ?? []).filter((c) => {
    if (!t) return true;
    const vals = field === "all" ? [c.name, c.contact, c.email, String(c.customerId)] : [String(c[field as keyof Customer] ?? "")];
    return vals.some((v) => v?.toLowerCase().includes(t));
  });

  return (
    <>
      <PageHeader title="Customers" description="Click a row to see vehicles and parking history." />
      <Card padding="none">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchField label="Search customers" placeholder="Search…" value={term} onChange={(e) => setTerm(e.target.value)} className="sm:w-80" />
            <Select aria-label="Filter field" value={field} onChange={(e) => setField(e.target.value)} className="sm:w-44">
              <option value="all">All fields</option><option value="name">Name</option>
              <option value="contact">Contact</option><option value="email">Email</option>
            </Select>
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="size-4" />Add Customer</Button>
        </div>
        <DataTable
          rows={rows}
          rowKey={(r) => r.customerId}
          loading={query.isLoading}
          error={errMsg(query.error)}
          onRetry={() => query.refetch()}
          onRowClick={setSelected}
          emptyTitle="No customers found"
          columns={[
            { key: "id", header: "Customer ID", cell: (r) => r.customerId, sortValue: (r) => r.customerId },
            { key: "name", header: "Name", cell: (r) => <span className="font-medium">{r.name}</span>, sortValue: (r) => r.name },
            { key: "contact", header: "Contact", cell: (r) => r.contact },
            { key: "email", header: "Email", cell: (r) => r.email },
            { key: "actions", header: "Actions", cell: (r) => (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="ghost" onClick={() => setEditCustomer(r)}><Edit className="size-3" />Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteCustomer(r)}><Trash2 className="size-3" />Delete</Button>
              </div>
            )}
          ]}
        />
      </Card>
      <Dialog open={!!selected} onClose={() => setSelected(null)} title={selected?.name} description={selected ? `${selected.email} · ${selected.contact}` : undefined} size="lg">
        {selected && <CustomerDetail id={selected.customerId} />}
      </Dialog>
      <AddCustomerDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <EditCustomerDialog customer={editCustomer} onClose={() => setEditCustomer(null)} />
      <DeleteCustomerDialog customer={deleteCustomer} onClose={() => setDeleteCustomer(null)} />
    </>
  );
}

function CustomerDetail({ id }: { id: number }) {
  const q = useQuery(customerQuery(id));
  if (q.isLoading) return <Skeleton shape="block" className="h-40" />;
  if (q.error || !q.data) return <ErrorState description={errMsg(q.error) ?? undefined} onRetry={() => q.refetch()} />;
  const d = q.data;
  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-2">
        <h3 className="font-semibold text-ink">Vehicles</h3>
        {d.vehicles.length ? d.vehicles.map((v) => (
          <div key={v.vehicleId} className="flex justify-between rounded-md border border-border px-3 py-2">
            <span className="font-medium">{v.licensePlate}</span><span className="text-ink-muted">{v.vehicleType}</span>
          </div>
        )) : <p className="text-ink-muted">No vehicles registered.</p>}
      </section>
      <section className="space-y-2">
        <h3 className="font-semibold text-ink">Parking sessions</h3>
        {d.sessions.length ? d.sessions.map((s) => (
          <div key={s.sessionId} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
            <span>#{s.sessionId} · {s.slotNumber}</span>
            <span className="text-ink-muted">{dateTime(s.entryTime)}</span>
            <StatusPill status={s.status} />
          </div>
        )) : <p className="text-ink-muted">No sessions yet.</p>}
      </section>
    </div>
  );
}

// Add Customer Dialog
function AddCustomerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: { name: string; contact: string; email: string }) => {
      const res = await fetch(`${API_BASE}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add customer");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setName("");
      setContact("");
      setEmail("");
      setError("");
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !email.trim()) {
      setError("All fields are required");
      return;
    }
    mutation.mutate({ name: name.trim(), contact: contact.trim(), email: email.trim() });
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add New Customer" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-ink focus:border-accent focus:outline-none"
            placeholder="Enter customer name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Contact *</label>
          <input
            type="tel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-ink focus:border-accent focus:outline-none"
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-ink focus:border-accent focus:outline-none"
            placeholder="Enter email address"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Adding..." : "Add Customer"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// Edit Customer Dialog
function EditCustomerDialog({ customer, onClose }: { customer: Customer | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useState(() => {
    if (customer) {
      setName(customer.name);
      setContact(customer.contact);
      setEmail(customer.email);
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: { name: string; contact: string; email: string }) => {
      const res = await fetch(`${API_BASE}/api/customers/${customer!.customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update customer");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setError("");
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !email.trim()) {
      setError("All fields are required");
      return;
    }
    mutation.mutate({ name: name.trim(), contact: contact.trim(), email: email.trim() });
  };

  if (!customer) return null;

  return (
    <Dialog open={!!customer} onClose={onClose} title="Edit Customer" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-ink focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Contact *</label>
          <input
            type="tel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-ink focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-ink focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Updating..." : "Update Customer"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// Delete Customer Dialog
function DeleteCustomerDialog({ customer, onClose }: { customer: Customer | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/api/customers/${customer!.customerId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete customer");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setError("");
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  if (!customer) return null;

  return (
    <Dialog open={!!customer} onClose={onClose} title="Delete Customer" size="sm">
      <div className="space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        <p className="text-ink">
          Are you sure you want to delete <strong>{customer.name}</strong>?
        </p>
        <p className="text-sm text-ink-muted">
          This action cannot be undone. If this customer has related vehicles or sessions, the deletion may fail.
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
