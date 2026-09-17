import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cx, formatRange, getPageNumbers } from "../utils/helpers";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZES = [10, 25, 50, 100];
const PAGE_SIZE_ITEMS = PAGE_SIZES.map((size) => ({
  value: String(size),
  label: String(size),
}));

function PaginationComponent({
  page,
  pageSize,
  totalPages,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const pageNumbers = getPageNumbers(page, totalPages);

  const jumpTo = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number.parseInt(event.target.value, 10);
      if (Number.isNaN(parsed)) return;
      onPageChange(Math.min(Math.max(parsed, 1), totalPages));
    },
    [onPageChange, totalPages],
  );

  return (
    <nav
      className="mt-4 flex flex-wrap items-center justify-between gap-3"
      aria-label="Pagination"
    >
      <p className="text-sm text-muted-foreground">
        {formatRange(page, pageSize, totalCount)}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>

        <div className="flex gap-1">
          {pageNumbers.map((entry) =>
            typeof entry === "number" ? (
              <Button
                key={entry}
                type="button"
                variant={entry === page ? "default" : "outline"}
                size="icon-sm"
                className={cx("text-xs", entry !== page && "text-foreground")}
                aria-current={entry === page ? "page" : undefined}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </Button>
            ) : (
              <span
                key={entry}
                className="self-center px-1 text-muted-foreground"
                aria-hidden="true"
              >
                …
              </span>
            ),
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>

        <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Go to</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            defaultValue={page}
            key={page}
            onChange={jumpTo}
            aria-label={`Jump to page, 1 to ${totalPages}`}
            className="h-8 w-16"
          />
        </label>

        <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            items={PAGE_SIZE_ITEMS}
          >
            <SelectTrigger size="sm" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>
    </nav>
  );
}

export default memo(PaginationComponent);
