import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EMPLOYEE_QUERY_KEY, fetchEmployees } from "../services/employeeApi";
import { sanitizeEmail, sanitizeText } from "../utils/sanitize";
import type {
  Department,
  Employee,
  EmployeeFormValues,
} from "../types/employee";
import { useDebouncedValue } from "./useDebouncedValue";

const DEFAULT_PAGE_SIZE = 25;

type LoadStatus = "loading" | "success" | "error";

function toEmployee(id: number, values: EmployeeFormValues): Employee {
  return {
    id,
    firstName: sanitizeText(values.firstName),
    lastName: sanitizeText(values.lastName),
    email: sanitizeEmail(values.email),
    department: values.department as Department,
    role: values.role as Employee["role"],
    status: values.status,
  };
}

export function useEmployees() {
  const queryClient = useQueryClient();

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: EMPLOYEE_QUERY_KEY,
    queryFn: ({ signal }) => fetchEmployees(signal),
  });

  const employees = useMemo(() => data ?? [], [data]);

  const loadStatus: LoadStatus = isPending
    ? "loading"
    : isError
      ? "error"
      : "success";
  const errorMessage = isError
    ? error instanceof Error && error.message
      ? error.message
      : "Something went wrong while loading employees. Please try again."
    : null;

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const reload = useCallback(() => {
    void refetch();
  }, [refetch]);

  const mutateEmployees = useCallback(
    (updater: (current: Employee[]) => Employee[]) => {
      queryClient.setQueryData<Employee[]>(EMPLOYEE_QUERY_KEY, (current = []) =>
        updater(current),
      );
    },
    [queryClient],
  );

  const departments = useMemo<Department[]>(() => {
    const unique = new Set<Department>();
    for (const employee of employees) unique.add(employee.department);
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  const filteredEmployees = useMemo<Employee[]>(() => {
    const query = sanitizeText(debouncedSearch).toLowerCase();
    return employees.filter((employee) => {
      const matchesDepartment =
        selectedDepartments.length === 0 ||
        selectedDepartments.includes(employee.department);
      if (!matchesDepartment) return false;
      if (!query) return true;
      return (
        `${employee.firstName} ${employee.lastName}`
          .toLowerCase()
          .includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query)
      );
    });
  }, [employees, debouncedSearch, selectedDepartments]);

  const sortedEmployees = useMemo<Employee[]>(() => {
    return [...filteredEmployees].sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
      ),
    );
  }, [filteredEmployees]);

  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedEmployees = useMemo<Employee[]>(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedEmployees.slice(start, start + pageSize);
  }, [sortedEmployees, currentPage, pageSize]);

  const toggleDepartment = useCallback((dept: Department) => {
    setSelectedDepartments((current) =>
      current.includes(dept)
        ? current.filter((item) => item !== dept)
        : [...current, dept],
    );
    setPage(1);
  }, []);

  const clearDepartments = useCallback(() => {
    setSelectedDepartments([]);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const addEmployee = useCallback(
    (values: EmployeeFormValues) => {
      mutateEmployees((current) => {
        const nextId =
          current.length > 0
            ? Math.max(...current.map((employee) => employee.id)) + 1
            : 1;
        return [toEmployee(nextId, values), ...current];
      });
    },
    [mutateEmployees],
  );

  const updateEmployee = useCallback(
    (id: number, values: EmployeeFormValues) => {
      mutateEmployees((current) =>
        current.map((employee) =>
          employee.id === id ? toEmployee(id, values) : employee,
        ),
      );
    },
    [mutateEmployees],
  );

  const deleteEmployee = useCallback(
    (id: number) => {
      mutateEmployees((current) =>
        current.filter((employee) => employee.id !== id),
      );
    },
    [mutateEmployees],
  );

  const resetFilters = useCallback(() => {
    setSearchInput("");
    setSelectedDepartments([]);
    setPage(1);
  }, []);

  return {
    loadStatus,
    error: errorMessage,
    reload,
    departments,
    searchInput,
    onSearchChange: handleSearchChange,
    activeSearch: debouncedSearch,
    selectedDepartments,
    toggleDepartment,
    clearDepartments,
    page: currentPage,
    pageSize,
    setPage,
    setPageSize,
    totalPages,
    paginatedEmployees,
    resultEmployees: sortedEmployees,
    totalCount: sortedEmployees.length,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    resetFilters,
  };
}
