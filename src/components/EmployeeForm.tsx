import { memo, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee, EmployeeFormValues } from "../types/employee";
import {
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  ROLES,
  STATUS_LABELS,
} from "../types/employee";
import {
  isValidEmail,
  MAX_TEXT_LENGTH,
  sanitizeEmail,
  sanitizeText,
} from "../utils/sanitize";

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (values: EmployeeFormValues) => void;
  onCancel: () => void;
}

const NAME_RE = /^[A-Za-z][A-Za-z' -]{1,39}$/;

const fieldCls = "flex flex-col gap-1.5";
const labelCls = "text-xs font-semibold";
const errorCls = "text-xs text-destructive";

const DEPARTMENT_ITEMS = DEPARTMENTS.map((value) => ({ value, label: value }));
const ROLE_ITEMS = ROLES.map((value) => ({ value, label: value }));
const STATUS_ITEMS = EMPLOYEE_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

function nameRules(label: string) {
  return {
    setValueAs: (value: string) => sanitizeText(value),
    validate: (value: string) => {
      if (!value) return `${label} is required.`;
      if (!NAME_RE.test(value)) {
        return "Use 2–40 letters, spaces, hyphens or apostrophes.";
      }
      return true;
    },
  } as const;
}

const emailRules = {
  setValueAs: (value: string) => sanitizeEmail(value),
  validate: (value: string) => {
    if (!value) return "Email is required.";
    if (!isValidEmail(value)) return "Enter a valid email address.";
    return true;
  },
} as const;

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: { value: string; label: string }[];
  error?: string;
  placeholder?: string;
}

function FormSelect({
  id,
  label,
  value,
  onChange,
  items,
  error,
  placeholder = "Select…",
}: FormSelectProps) {
  const errorId = `${id}-error`;
  return (
    <div className={fieldCls}>
      <Label className={labelCls} htmlFor={id}>
        {label}
      </Label>
      <Select
        value={value === "" ? null : value}
        onValueChange={(next) => onChange(next as string)}
        items={items}
      >
        <SelectTrigger
          id={id}
          className="h-9 w-full"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <span id={errorId} className={errorCls} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

function buildDefaultValues(employee?: Employee | null): EmployeeFormValues {
  if (employee) {
    return {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      department: employee.department,
      role: employee.role,
      status: employee.status,
    };
  }
  return {
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    role: "",
    status: "active",
  };
}

function EmployeeFormComponent({
  employee,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const formId = useId();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    defaultValues: buildDefaultValues(employee),
    mode: "onTouched",
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((values) => onSubmit(values))}
      noValidate
    >
      <h3 className="visually-hidden">
        {employee ? `Edit employee #${employee.id}` : "Add new employee"}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={fieldCls}>
          <Label className={labelCls} htmlFor={`${formId}-first`}>
            First name *
          </Label>
          <Input
            id={`${formId}-first`}
            data-autofocus
            type="text"
            maxLength={MAX_TEXT_LENGTH}
            autoComplete="given-name"
            className="h-9"
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={
              errors.firstName ? `${formId}-first-error` : undefined
            }
            {...register("firstName", nameRules("First name"))}
          />
          {errors.firstName ? (
            <span
              id={`${formId}-first-error`}
              className={errorCls}
              role="alert"
            >
              {errors.firstName.message}
            </span>
          ) : null}
        </div>

        <div className={fieldCls}>
          <Label className={labelCls} htmlFor={`${formId}-last`}>
            Last name *
          </Label>
          <Input
            id={`${formId}-last`}
            type="text"
            maxLength={MAX_TEXT_LENGTH}
            autoComplete="family-name"
            className="h-9"
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={
              errors.lastName ? `${formId}-last-error` : undefined
            }
            {...register("lastName", nameRules("Last name"))}
          />
          {errors.lastName ? (
            <span id={`${formId}-last-error`} className={errorCls} role="alert">
              {errors.lastName.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className={fieldCls}>
        <Label className={labelCls} htmlFor={`${formId}-email`}>
          Email *
        </Label>
        <Input
          id={`${formId}-email`}
          type="email"
          maxLength={160}
          autoComplete="email"
          inputMode="email"
          className="h-9"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
          {...register("email", emailRules)}
        />
        {errors.email ? (
          <span id={`${formId}-email-error`} className={errorCls} role="alert">
            {errors.email.message}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="department"
          rules={{ required: "Select a department." }}
          render={({ field, fieldState }) => (
            <FormSelect
              id={`${formId}-department`}
              label="Department *"
              value={field.value}
              onChange={field.onChange}
              items={DEPARTMENT_ITEMS}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="role"
          rules={{ required: "Select a role." }}
          render={({ field, fieldState }) => (
            <FormSelect
              id={`${formId}-role`}
              label="Role *"
              value={field.value}
              onChange={field.onChange}
              items={ROLE_ITEMS}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="status"
        rules={{ required: "Select a status." }}
        render={({ field, fieldState }) => (
          <FormSelect
            id={`${formId}-status`}
            label="Status *"
            value={field.value}
            onChange={field.onChange}
            items={STATUS_ITEMS}
            error={fieldState.error?.message}
          />
        )}
      />

      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg">
          {employee ? "Save changes" : "Add employee"}
        </Button>
      </div>
    </form>
  );
}

export default memo(EmployeeFormComponent);
