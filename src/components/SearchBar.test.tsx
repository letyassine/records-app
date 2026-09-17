import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "./SearchBar";

function ControlledSearchBar({ onChange }: { onChange?: (v: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <SearchBar
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      onClear={() => setValue("")}
      resultCount={3}
    />
  );
}

describe("SearchBar", () => {
  it("emits the full value while typing", async () => {
    const onChange = vi.fn();
    render(<ControlledSearchBar onChange={onChange} />);

    await userEvent.type(screen.getByLabelText(/search employees/i), "jane");

    expect(onChange).toHaveBeenLastCalledWith("jane");
  });

  it("shows a pluralized result count", () => {
    render(
      <SearchBar
        value=""
        onChange={vi.fn()}
        onClear={vi.fn()}
        resultCount={3}
      />,
    );

    expect(screen.getByText("3 results")).toBeInTheDocument();
  });

  it("shows a singular result count", () => {
    render(
      <SearchBar
        value=""
        onChange={vi.fn()}
        onClear={vi.fn()}
        resultCount={1}
      />,
    );

    expect(screen.getByText("1 result")).toBeInTheDocument();
  });

  it("calls onClear from the clear button", async () => {
    const onClear = vi.fn();
    render(
      <SearchBar
        value="jane"
        onChange={vi.fn()}
        onClear={onClear}
        resultCount={1}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /clear search/i }),
    );

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("hides the clear button when empty", () => {
    render(
      <SearchBar
        value=""
        onChange={vi.fn()}
        onClear={vi.fn()}
        resultCount={0}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /clear search/i }),
    ).not.toBeInTheDocument();
  });
});
