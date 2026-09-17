import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "./Pagination";

const noop = () => {};

describe("Pagination", () => {
  it("renders the visible range", () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalPages={3}
        totalCount={25}
        onPageChange={noop}
        onPageSizeChange={noop}
      />,
    );

    expect(screen.getByText("Showing 1–10 of 25")).toBeInTheDocument();
  });

  it("disables Previous on the first page and Next on the last", () => {
    const { rerender } = render(
      <Pagination
        page={1}
        pageSize={10}
        totalPages={3}
        totalCount={25}
        onPageChange={noop}
        onPageSizeChange={noop}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();

    rerender(
      <Pagination
        page={3}
        pageSize={10}
        totalPages={3}
        totalCount={25}
        onPageChange={noop}
        onPageSizeChange={noop}
      />,
    );

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("navigates to the next page", async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalPages={3}
        totalCount={25}
        onPageChange={onPageChange}
        onPageSizeChange={noop}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("marks the active page and jumps when a page number is clicked", async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={2}
        pageSize={10}
        totalPages={3}
        totalCount={25}
        onPageChange={onPageChange}
        onPageSizeChange={noop}
      />,
    );

    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await userEvent.click(screen.getByRole("button", { name: "3" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
