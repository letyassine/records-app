import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Department } from "../types/employee";
import { cx } from "../utils/helpers";

interface FilterPanelProps {
  departments: Department[];
  selected: Department[];
  onToggle: (department: Department) => void;
  onClear: () => void;
}

function FilterPanelComponent({
  departments,
  selected,
  onToggle,
  onClear,
}: FilterPanelProps) {
  const selectedSet = new Set(selected);

  return (
    <section
      className="min-w-[320px] flex-1 basis-96"
      aria-label="Filter by department"
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Departments
        </h2>
        {selected.length > 0 ? (
          <button
            type="button"
            className="cursor-pointer text-xs font-medium text-primary hover:underline"
            onClick={onClear}
          >
            Clear ({selected.length})
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {departments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No departments available.
          </p>
        ) : (
          departments.map((department) => {
            const isSelected = selectedSet.has(department);
            return (
              <label
                key={department}
                className={cx(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors select-none",
                  isSelected
                    ? "border-primary bg-primary/10 font-semibold text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggle(department)}
                />
                <span>{department}</span>
              </label>
            );
          })
        )}
      </div>
    </section>
  );
}

export default memo(FilterPanelComponent);
