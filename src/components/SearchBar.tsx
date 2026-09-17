import { memo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  resultCount: number;
}

function SearchBarComponent({
  value,
  onChange,
  onClear,
  resultCount,
}: SearchBarProps) {
  return (
    <div className="min-w-70 flex-1 basis-80">
      <label className="visually-hidden" htmlFor="employee-search">
        Search employees
      </label>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <Input
          id="employee-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by name, email or role…"
          autoComplete="off"
          spellCheck={false}
          maxLength={120}
          className="h-10 pr-9 pl-9 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        />
        {value ? (
          <button
            type="button"
            className="absolute right-2.5 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            onClick={onClear}
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground" aria-live="polite">
        {resultCount} {resultCount === 1 ? "result" : "results"}
      </p>
    </div>
  );
}

export default memo(SearchBarComponent);
