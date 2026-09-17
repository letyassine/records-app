import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterPanel from "./FilterPanel";
import type { Department } from "../types/employee";

const DEPARTMENTS: Department[] = ["Engineering", "Design"];

describe("FilterPanel", () => {
  it("renders every department as a checkbox", () => {
    render(
      <FilterPanel
        departments={DEPARTMENTS}
        selected={[]}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("reflects the selected state", () => {
    render(
      <FilterPanel
        departments={DEPARTMENTS}
        selected={["Engineering"]}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("checkbox")[0]).toBeChecked();
    expect(screen.getAllByRole("checkbox")[1]).not.toBeChecked();
  });

  it("toggles a department when its checkbox is clicked", async () => {
    const onToggle = vi.fn();
    render(
      <FilterPanel
        departments={DEPARTMENTS}
        selected={[]}
        onToggle={onToggle}
        onClear={vi.fn()}
      />,
    );

    await userEvent.click(screen.getAllByRole("checkbox")[1]);

    expect(onToggle).toHaveBeenCalledWith("Design");
  });

  it("shows a clear button only when something is selected", async () => {
    const onClear = vi.fn();
    const { rerender } = render(
      <FilterPanel
        departments={DEPARTMENTS}
        selected={[]}
        onToggle={vi.fn()}
        onClear={onClear}
      />,
    );

    expect(screen.queryByText(/clear/i)).not.toBeInTheDocument();

    rerender(
      <FilterPanel
        departments={DEPARTMENTS}
        selected={["Engineering"]}
        onToggle={vi.fn()}
        onClear={onClear}
      />,
    );

    await userEvent.click(screen.getByText(/clear/i));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("renders an empty state when there are no departments", () => {
    render(
      <FilterPanel
        departments={[]}
        selected={[]}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByText(/no departments available/i)).toBeInTheDocument();
  });
});
