import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, EmptyState, ErrorState, FilterBar, OccupancyMeter, PageHeader, ParkingGrid, Skeleton } from "@/design-system/companion-library-764952";
import { errMsg, slotsQuery } from "@/lib/api";

export const Route = createFileRoute("/_app/slots")({
  head: () => ({
    meta: [
      { title: "Parking Slots — ParkSmart" },
      { name: "description", content: "Live 3D view of every parking slot and its status." },
      { property: "og:title", content: "Parking Slots — ParkSmart" },
      { property: "og:description", content: "Live 3D view of every parking slot and its status." },
    ],
  }),
  component: SlotsPage,
});

function SlotsPage() {
  const q = useQuery(slotsQuery);
  const [filter, setFilter] = useState("ALL");
  const all = q.data ?? [];
  const rows = filter === "ALL" ? all : all.filter((s) => s.status === filter || s.vehicleType === filter);
  const occupied = all.filter((s) => s.status === "OCCUPIED").length;

  return (
    <>
      <PageHeader title="Parking Slots" description="Refreshes every 5 seconds from the database." />
      <Card>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <FilterBar
            value={filter}
            onChange={setFilter}
            options={[
              { label: "All", value: "ALL" }, { label: "Free", value: "FREE" }, { label: "Occupied", value: "OCCUPIED" },
              { label: "Car", value: "CAR" }, { label: "Bike", value: "BIKE" },
            ]}
          />
          {all.length > 0 && <OccupancyMeter occupied={occupied} total={all.length} className="sm:w-72" />}
        </div>
        {q.isLoading ? <Skeleton shape="block" className="h-80" /> :
          q.error ? <ErrorState description={errMsg(q.error) ?? undefined} onRetry={() => q.refetch()} /> :
          rows.length ? <ParkingGrid slots={rows} /> : <EmptyState title="No slots match this filter" />}
      </Card>
    </>
  );
}
