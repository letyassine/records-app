export type Department =
  | "Engineering"
  | "Design"
  | "Product"
  | "Data"
  | "Operations"
  | "Human Resources"
  | "Marketing"
  | "Sales"
  | "Finance"
  | "Support";

export type Role =
  | "Engineer"
  | "Senior Engineer"
  | "Designer"
  | "Product Manager"
  | "Data Analyst"
  | "Team Lead"
  | "Support Specialist"
  | "Operations Manager";

export type EmployeeStatus = "active" | "inactive" | "on_leave";

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: Department;
  role: Role;
  status: EmployeeStatus;
}

export interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  email: string;
  department: Department | "";
  role: Role | "";
  status: EmployeeStatus;
}

export const DEPARTMENTS: readonly Department[] = [
  "Engineering",
  "Design",
  "Product",
  "Data",
  "Operations",
  "Human Resources",
  "Marketing",
  "Sales",
  "Finance",
  "Support",
];

export const ROLES: readonly Role[] = [
  "Engineer",
  "Senior Engineer",
  "Designer",
  "Product Manager",
  "Data Analyst",
  "Team Lead",
  "Support Specialist",
  "Operations Manager",
];

export const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On Leave",
};

export const EMPLOYEE_STATUSES: readonly EmployeeStatus[] = [
  "active",
  "inactive",
  "on_leave",
];
