import { memo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Employee, EmployeeStatus } from "../types/employee";
import { STATUS_LABELS } from "../types/employee";
import { cx } from "../utils/helpers";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  emptyMessage?: string;
}

const ROW_HEIGHT = 52;
const VIEWPORT_HEIGHT = 520;
const OVERSCAN = 8;

const GRID =
  "grid min-w-[880px] grid-cols-[72px_1.4fr_2fr_1.2fr_1.3fr_100px_150px] items-center";

const STATUS_BADGE: Record<EmployeeStatus, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-200 text-slate-700",
  on_leave: "bg-amber-100 text-amber-700",
};

interface RowProps {
  employee: Employee;
  offset: number;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

const Row = memo(function Row({
  employee,
  offset,
  onEdit,
  onDelete,
}: RowProps) {
  return (
    <div
      role="row"
      className={cx(
        GRID,
        "absolute right-0 left-0 border-b border-slate-100 bg-white hover:bg-slate-50",
      )}
      style={{ transform: `translateY(${offset}px)`, height: ROW_HEIGHT }}
    >
      <div role="cell" className="truncate px-3.5 text-sm text-slate-400">
        #{employee.id}
      </div>
      <div
        role="cell"
        className="truncate px-3.5 text-sm font-medium text-slate-800"
      >
        {employee.firstName} {employee.lastName}
      </div>
      <div role="cell" className="truncate px-3.5 text-sm">
        <a
          className="text-slate-500 hover:text-brand-600 hover:underline"
          href={`mailto:${encodeURIComponent(employee.email)}`}
        >
          {employee.email}
        </a>
      </div>
      <div role="cell" className="truncate px-3.5 text-sm text-slate-600">
        {employee.department}
      </div>
      <div role="cell" className="truncate px-3.5 text-sm text-slate-600">
        {employee.role}
      </div>
      <div role="cell" className="px-3.5">
        <Badge
          variant="outline"
          className={cx("border-transparent", STATUS_BADGE[employee.status])}
        >
          {STATUS_LABELS[employee.status]}
        </Badge>
      </div>
      <div role="cell" className="flex justify-end gap-1.5 px-3.5">
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => onEdit(employee)}
        >
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="xs"
          onClick={() => onDelete(employee)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
});

function EmployeeTableComponent({
  employees,
  onEdit,
  onDelete,
  emptyMessage = "No records to display.",
}: EmployeeTableProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  // TanStack Virtual intentionally exposes dynamic measurement APIs that the
  // React Compiler cannot memoize; the table is already wrapped in memo().
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: employees.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div
      className="scrollbar-slim overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      role="table"
      aria-rowcount={employees.length}
      aria-colcount={7}
    >
      <div
        className={cx(
          GRID,
          "border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase",
        )}
        role="row"
      >
        <div role="columnheader" className="px-3.5 py-2.5">
          ID
        </div>
        <div role="columnheader" className="px-3.5 py-2.5">
          Name
        </div>
        <div role="columnheader" className="px-3.5 py-2.5">
          Email
        </div>
        <div role="columnheader" className="px-3.5 py-2.5">
          Department
        </div>
        <div role="columnheader" className="px-3.5 py-2.5">
          Role
        </div>
        <div role="columnheader" className="px-3.5 py-2.5">
          Status
        </div>
        <div role="columnheader" className="px-3.5 py-2.5 text-right">
          Actions
        </div>
      </div>

      <div
        className="scrollbar-slim relative overflow-x-auto overflow-y-auto"
        ref={viewportRef}
        style={{ height: VIEWPORT_HEIGHT }}
      >
        {employees.length === 0 ? (
          <div className="flex h-full min-w-220 items-center justify-center text-sm text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          <div
            className="relative min-w-220"
            style={{ height: rowVirtualizer.getTotalSize() }}
          >
            {virtualRows.map((virtualRow) => {
              const employee = employees[virtualRow.index];
              return (
                <Row
                  key={employee.id}
                  employee={employee}
                  offset={virtualRow.start}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              );
            })}
          </div>
        )}
      </div>

      {employees.length > 0 ? (
        <div
          className="border-t border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[11px] text-slate-500"
          aria-hidden="true"
        >
          {virtualRows.length} of {employees.length} rows rendered · virtualized
        </div>
      ) : null}
    </div>
  );
}

export default memo(EmployeeTableComponent);
