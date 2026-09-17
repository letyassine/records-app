import { Suspense, lazy, useCallback, useMemo, useState } from "react";
import EmployeeTable from "./components/EmployeeTable";
import FilterPanel from "./components/FilterPanel";
import Loading from "./components/Loading";
import Modal from "./components/Modal";
import Pagination from "./components/Pagination";
import SearchBar from "./components/SearchBar";
import { Button } from "@/components/ui/button";
import { useEmployees } from "./hooks/useEmployees";
import type { Employee, EmployeeFormValues } from "./types/employee";
import { downloadCsv, downloadJson, type CsvRow } from "./utils/exportUtils";
import { STATUS_LABELS } from "./types/employee";

const EmployeeForm = lazy(() => import("./components/EmployeeForm"));

const CSV_HEADER: CsvRow = [
  "ID",
  "First Name",
  "Last Name",
  "Email",
  "Department",
  "Role",
  "Status",
];

function toCsvRows(employees: Employee[]): CsvRow[] {
  return employees.map((employee) => [
    employee.id,
    employee.firstName,
    employee.lastName,
    employee.email,
    employee.department,
    employee.role,
    STATUS_LABELS[employee.status],
  ]);
}

function App() {
  const {
    loadStatus,
    error,
    reload,
    departments,
    searchInput,
    onSearchChange,
    activeSearch,
    selectedDepartments,
    toggleDepartment,
    clearDepartments,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalPages,
    paginatedEmployees,
    resultEmployees,
    totalCount,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    resetFilters,
  } = useEmployees();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const openAddForm = useCallback(() => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  }, []);

  const handleSubmit = useCallback(
    (values: EmployeeFormValues) => {
      if (editingEmployee) updateEmployee(editingEmployee.id, values);
      else addEmployee(values);
      closeForm();
    },
    [addEmployee, closeForm, editingEmployee, updateEmployee],
  );

  const requestDelete = useCallback((employee: Employee) => {
    setDeleteTarget(employee);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTarget) deleteEmployee(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteEmployee, deleteTarget]);

  const isFiltered =
    searchInput.trim().length > 0 || selectedDepartments.length > 0;

  const clearSearch = useCallback(() => onSearchChange(""), [onSearchChange]);

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    [setPage, setPageSize],
  );

  const closeDeleteModal = useCallback(() => setDeleteTarget(null), []);

  const handleExportCsv = useCallback(() => {
    if (resultEmployees.length === 0) return;
    downloadCsv("employees.csv", CSV_HEADER, toCsvRows(resultEmployees));
  }, [resultEmployees]);

  const handleExportJson = useCallback(() => {
    if (resultEmployees.length === 0) return;
    downloadJson("employees.json", resultEmployees);
  }, [resultEmployees]);

  const emptyMessage = useMemo(() => {
    if (loadStatus !== "success") return "No records to display.";
    if (isFiltered) return "No employees match your search or filters.";
    return "No employees yet. Add your first record.";
  }, [isFiltered, loadStatus]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 pb-12">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Employee Records
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {totalCount.toLocaleString()} employees · search, filter, export
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleExportCsv}
            disabled={resultEmployees.length === 0}
          >
            Export CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleExportJson}
            disabled={resultEmployees.length === 0}
          >
            Export JSON
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={openAddForm}
            disabled={loadStatus === "loading"}
          >
            + Add employee
          </Button>
        </div>
      </header>

      <section
        className="mb-4 flex flex-wrap items-start justify-between gap-4"
        aria-label="Search and filters"
      >
        <SearchBar
          value={searchInput}
          onChange={onSearchChange}
          onClear={clearSearch}
          resultCount={totalCount}
        />
        <FilterPanel
          departments={departments}
          selected={selectedDepartments}
          onToggle={toggleDepartment}
          onClear={clearDepartments}
        />
      </section>

      <main>
        {loadStatus === "loading" ? (
          <Loading label="Loading employees…" />
        ) : loadStatus === "error" ? (
          <div
            className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-10 text-center text-red-900"
            role="alert"
          >
            <h2 className="text-lg font-semibold">
              We couldn’t load the records
            </h2>
            <p className="text-sm">{error}</p>
            <Button type="button" size="lg" onClick={reload}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <EmployeeTable
              key={`${page}-${pageSize}-${activeSearch}-${selectedDepartments.join("|")}`}
              employees={paginatedEmployees}
              onEdit={openEditForm}
              onDelete={requestDelete}
              emptyMessage={emptyMessage}
            />
            {isFiltered && totalCount === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center text-slate-500">
                <p className="text-sm">
                  No matches. Try adjusting your search or filters.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={resetFilters}
                >
                  Reset search &amp; filters
                </Button>
              </div>
            ) : null}
            <Pagination
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </main>

      {isFormOpen ? (
        <Modal
          isOpen={isFormOpen}
          title={editingEmployee ? "Edit employee" : "Add employee"}
          onClose={closeForm}
        >
          <Suspense fallback={<Loading label="Loading form…" />}>
            <EmployeeForm
              employee={editingEmployee}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </Suspense>
        </Modal>
      ) : null}

      <Modal
        isOpen={deleteTarget !== null}
        title="Delete employee"
        onClose={closeDeleteModal}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={closeDeleteModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900">
            {deleteTarget
              ? `${deleteTarget.firstName} ${deleteTarget.lastName}`
              : ""}
          </strong>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default App;
