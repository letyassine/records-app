import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Employee } from "../types/employee";
import { fetchEmployees } from "../services/employeeApi";
import { useEmployees } from "./useEmployees";

vi.mock("../services/employeeApi", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../services/employeeApi")>();
  return { ...actual, fetchEmployees: vi.fn() };
});

const fetchEmployeesMock = vi.mocked(fetchEmployees);

const EMPLOYEES: Employee[] = [
  {
    id: 1,
    firstName: "Alice",
    lastName: "Zephyr",
    email: "alice@example.com",
    department: "Engineering",
    role: "Engineer",
    status: "active",
  },
  {
    id: 2,
    firstName: "Bob",
    lastName: "Young",
    email: "bob@example.com",
    department: "Design",
    role: "Designer",
    status: "inactive",
  },
  {
    id: 3,
    firstName: "Cara",
    lastName: "Xu",
    email: "cara@example.com",
    department: "Engineering",
    role: "Team Lead",
    status: "on_leave",
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

async function renderEmployees() {
  const view = renderHook(() => useEmployees(), { wrapper: createWrapper() });
  await waitFor(() => expect(view.result.current.loadStatus).toBe("success"));
  return view;
}

beforeEach(() => {
  fetchEmployeesMock.mockReset();
  fetchEmployeesMock.mockResolvedValue(
    EMPLOYEES.map((employee) => ({ ...employee })),
  );
});

describe("useEmployees", () => {
  it("loads and sorts employees by last name", async () => {
    const { result } = await renderEmployees();

    expect(
      result.current.resultEmployees.map((employee) => employee.id),
    ).toEqual([3, 2, 1]);
    expect(result.current.totalCount).toBe(3);
  });

  it("derives unique, sorted departments", async () => {
    const { result } = await renderEmployees();

    expect(result.current.departments).toEqual(["Design", "Engineering"]);
  });

  it("filters by department and clears the filter", async () => {
    const { result } = await renderEmployees();

    act(() => result.current.toggleDepartment("Engineering"));
    expect(result.current.totalCount).toBe(2);

    act(() => result.current.clearDepartments());
    expect(result.current.totalCount).toBe(3);
  });

  it("filters by debounced search", async () => {
    const { result } = await renderEmployees();

    act(() => result.current.onSearchChange("bob"));

    await waitFor(() => expect(result.current.totalCount).toBe(1));
    expect(result.current.resultEmployees[0].firstName).toBe("Bob");
  });

  it("adds, updates and deletes employees in the cache", async () => {
    const { result } = await renderEmployees();

    act(() =>
      result.current.addEmployee({
        firstName: "New",
        lastName: "Person",
        email: "new@example.com",
        department: "Sales",
        role: "Engineer",
        status: "active",
      }),
    );
    await waitFor(() => expect(result.current.totalCount).toBe(4));
    expect(result.current.resultEmployees.some((e) => e.id === 4)).toBe(true);

    act(() =>
      result.current.updateEmployee(2, {
        firstName: "Bobby",
        lastName: "Young",
        email: "bob@example.com",
        department: "Design",
        role: "Designer",
        status: "inactive",
      }),
    );
    await waitFor(() =>
      expect(
        result.current.resultEmployees.find((e) => e.id === 2)?.firstName,
      ).toBe("Bobby"),
    );

    act(() => result.current.deleteEmployee(3));
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    expect(result.current.resultEmployees.some((e) => e.id === 3)).toBe(false);
  });

  it("paginates the sorted results", async () => {
    const { result } = await renderEmployees();

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedEmployees).toHaveLength(3);

    act(() => result.current.setPageSize(1));
    expect(result.current.totalPages).toBe(3);

    act(() => result.current.setPage(2));
    expect(result.current.paginatedEmployees.map((e) => e.id)).toEqual([2]);
  });

  it("reports an error status when the request fails", async () => {
    fetchEmployeesMock.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useEmployees(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loadStatus).toBe("error"));
    expect(result.current.error).toBe("network down");
  });
});
