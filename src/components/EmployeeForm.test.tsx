import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeeForm from "./EmployeeForm";
import type { Employee } from "../types/employee";

const EMPLOYEE: Employee = {
  id: 1,
  firstName: "Alice",
  lastName: "Zephyr",
  email: "alice@example.com",
  department: "Engineering",
  role: "Engineer",
  status: "active",
};

describe("EmployeeForm", () => {
  it("shows required errors on an empty submit", async () => {
    render(<EmployeeForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await userEvent.click(
      screen.getByRole("button", { name: /add employee/i }),
    );

    expect(
      await screen.findByText("First name is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Last name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Select a department.")).toBeInTheDocument();
    expect(screen.getByText("Select a role.")).toBeInTheDocument();
  });

  it("rejects an invalid name", async () => {
    render(<EmployeeForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/first name/i), "1234");
    await userEvent.tab();

    expect(
      await screen.findByText(
        /use 2–40 letters, spaces, hyphens or apostrophes/i,
      ),
    ).toBeInTheDocument();
  });

  it("prefills values when editing", () => {
    render(
      <EmployeeForm
        employee={EMPLOYEE}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Alice");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Zephyr");
    expect(screen.getByLabelText(/email/i)).toHaveValue("alice@example.com");
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
  });

  it("clears text-field errors once valid input is entered", async () => {
    render(<EmployeeForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await userEvent.click(
      screen.getByRole("button", { name: /add employee/i }),
    );
    await screen.findByText("First name is required.");

    await userEvent.type(screen.getByLabelText(/first name/i), "Jane");
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");

    await waitFor(() => {
      expect(
        screen.queryByText("First name is required."),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Email is required.")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Select a department.")).toBeInTheDocument();
  });

  it("submits sanitized values once the form is valid", async () => {
    const onSubmit = vi.fn();
    render(<EmployeeForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/first name/i), "  Jane ");
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "Jane@Example.com");

    await userEvent.click(screen.getByLabelText(/department/i));
    await userEvent.click(
      await screen.findByRole("option", { name: "Engineering" }),
    );

    await userEvent.click(screen.getByLabelText(/^role/i));
    await userEvent.click(
      await screen.findByRole("option", { name: "Engineer" }),
    );

    await userEvent.click(
      screen.getByRole("button", { name: /add employee/i }),
    );

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      department: "Engineering",
      role: "Engineer",
      status: "active",
    });
  });

  it("calls onCancel from the cancel button", async () => {
    const onCancel = vi.fn();
    render(<EmployeeForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
