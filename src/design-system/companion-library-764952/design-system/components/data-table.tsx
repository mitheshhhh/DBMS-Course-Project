import * as React from "react";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "../lib/utils";
import { Skeleton, EmptyState, ErrorState } from "./feedback";

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** Return a comparable value to enable sorting on this column. */
  sortValue?: (row: T) => string | number;
  align?: "left" | "right";
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  className?: string;
}

/** Records table with sticky header, sorting, paging and loading/empty/error states. */
export function DataTable<T>({
  columns, rows, rowKey, loading, error, onRetry, onRowClick,
  emptyTitle = "No records found", emptyDescription, pageSize = 10, className,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = React.useState(1);

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => (col.sortValue!(a) > col.sortValue!(b) ? 1 : -1) * sort.dir);
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  React.useEffect(() => setPage(1), [rows.length]);
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-surface shadow-card", className)}>
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-canvas/95 backdrop-blur-sm">
            <tr className="border-b border-border">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                const Icon = !active ? ArrowUpDown : sort!.dir === 1 ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (sort!.dir === 1 ? "ascending" : "descending") : undefined}
                    className={cn("whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-ink-muted", c.align === "right" ? "text-right" : "text-left")}
                  >
                    {c.sortValue ? (
                      <button
                        type="button"
                        onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 }))}
                        className="inline-flex items-center gap-1 hover:text-ink"
                      >
                        {c.header}
                        <Icon className={cn("size-3", active ? "text-ink" : "text-ink-subtle")} />
                      </button>
                    ) : c.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3.5"><Skeleton className="w-3/4" /></td>
                  ))}
                </tr>
              ))}
            {!loading && !error &&
              visible.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={{ animationDelay: `${i * 25}ms` }}
                  className={cn(
                    "animate-fade-up border-b border-border transition-colors duration-150 last:border-0 hover:bg-canvas",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("whitespace-nowrap px-4 py-3 text-ink", c.align === "right" && "text-right tabular-nums", c.className)}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && error && <ErrorState description={error} onRetry={onRetry} />}
        {!loading && !error && rows.length === 0 && <EmptyState title={emptyTitle} description={emptyDescription} />}
      </div>
      {!loading && !error && rows.length > pageSize && (
        <div className="border-t border-border px-4 py-2.5">
          <Pagination page={page} pageCount={pageCount} total={rows.length} pageSize={pageSize} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  page: number;
  pageCount: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

/** Previous/next pager with range summary. */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ page, pageCount, total, pageSize = 10, onPageChange, className, ...props }, ref) => (
    <nav ref={ref} aria-label="Pagination" className={cn("flex items-center justify-between text-xs text-ink-muted", className)} {...props}>
      <span>
        {total !== undefined
          ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`
          : `Page ${page} of ${pageCount}`}
      </span>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="grid size-7 place-items-center rounded-sm hover:bg-surface-sunken disabled:opacity-40">
          <ChevronLeft className="size-4" />
        </button>
        <span className="px-2 tabular-nums text-ink">{page} / {pageCount}</span>
        <button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} className="grid size-7 place-items-center rounded-sm hover:bg-surface-sunken disabled:opacity-40">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  ),
);
Pagination.displayName = "Pagination";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  /** Slot for a SearchField or extra controls. */
  children?: React.ReactNode;
}

/** Segmented filter chips plus optional search. */
export const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(
  ({ options, value, onChange, children, className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4 flex flex-wrap items-center justify-between gap-3", className)} {...props}>
      <div role="radiogroup" className="inline-flex rounded-md border border-border bg-surface-sunken p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-sm px-3 py-1.5 text-xs font-medium transition-all duration-200",
              value === o.value ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  ),
);
FilterBar.displayName = "FilterBar";
