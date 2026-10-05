import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Car, CircleCheck, IndianRupee, ParkingSquare } from "lucide-react";
import {
  ActivityList, Card, CardHeader, EmptyState, ErrorState, OccupancyMeter, PageHeader, ParkingGrid, Skeleton, StatCard,
} from "@/design-system/companion-library-764952";
import { CustomerSearch } from "@/components/CustomerSearch";
import { activityQuery, dateTime, errMsg, money, slotsQuery, statsQuery } from "@/lib/api";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ParkSmart" },
      { name: "description", content: "Live parking occupancy, sessions and revenue overview." },
      { property: "og:title", content: "Dashboard — ParkSmart" },
      { property: "og:description", content: "Live parking occupancy, sessions and revenue overview." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const stats = useQuery(statsQuery);
  const slots = useQuery(slotsQuery);
  const activity = useQuery(activityQuery);
  const s = stats.data;

  return (
    <>
      <PageHeader title="Dashboard" description="Live overview of your parking facility." />
      {stats.error ? (
        <ErrorState description={errMsg(stats.error) ?? undefined} onRetry={() => stats.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total slots" value={s?.totalSlots ?? 0} loading={stats.isLoading} icon={<ParkingSquare className="size-4" />} />
          <StatCard label="Occupied" value={s?.occupied ?? 0} loading={stats.isLoading} tone="dark" icon={<Car className="size-4" />} />
          <StatCard label="Available" value={s?.available ?? 0} loading={stats.isLoading} tone="accent" icon={<CircleCheck className="size-4" />} />
          <StatCard label="Active sessions" value={s?.activeSessions ?? 0} loading={stats.isLoading} icon={<Activity className="size-4" />} />
          <StatCard label="Total revenue" value={s?.totalRevenue ?? 0} format={money} loading={stats.isLoading} icon={<IndianRupee className="size-4" />} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Parking layout" description="Updates automatically" action={<Link to="/slots" className="text-sm text-ink-muted hover:text-ink">View all</Link>} />
          {slots.isLoading ? <Skeleton shape="block" className="h-64" /> :
            slots.error ? <ErrorState description={errMsg(slots.error) ?? undefined} onRetry={() => slots.refetch()} /> :
            slots.data?.length ? <ParkingGrid slots={slots.data} size="sm" /> : <EmptyState title="No slots found" />}
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Occupancy" />
            {stats.isLoading ? <Skeleton shape="block" className="h-16" /> : s ? <OccupancyMeter occupied={s.occupied} total={s.totalSlots} /> : null}
          </Card>
          <Card>
            <CardHeader title="Recent activity" />
            {activity.isLoading ? <Skeleton shape="block" className="h-40" /> :
              activity.error ? <ErrorState description={errMsg(activity.error) ?? undefined} onRetry={() => activity.refetch()} /> :
              activity.data?.length ? (
                <ActivityList items={activity.data.slice(0, 8).map((a) => ({ ...a, time: dateTime(a.time) }))} />
              ) : <EmptyState title="No activity yet" />}
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Quick customer search" description="Name, plate, parking status, duration and payment" />
        <CustomerSearch />
      </Card>
    </>
  );
}
