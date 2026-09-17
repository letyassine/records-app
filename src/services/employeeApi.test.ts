import { ApiError, EMPLOYEE_QUERY_KEY, fetchEmployees } from "./employeeApi";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("fetchEmployees", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exposes the shared query key", () => {
    expect(EMPLOYEE_QUERY_KEY).toEqual(["employees"]);
  });

  it("normalizes and expands a valid payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          users: [
            {
              id: 1,
              firstName: " Jane ",
              lastName: "Doe",
              email: "jane@example.com",
            },
            {
              id: 2,
              firstName: "John",
              lastName: "Smith",
              email: "john@example.com",
            },
          ],
        }),
      ),
    );

    const employees = await fetchEmployees();

    expect(employees.length).toBeGreaterThan(0);
    expect(employees[0]).toMatchObject({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
    });
  });

  it("drops malformed entries instead of trusting them", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          users: [
            {
              id: 1,
              firstName: "Jane",
              lastName: "Doe",
              email: "jane@example.com",
            },
            { id: 2, firstName: 42, lastName: null, email: "x" },
            "not-an-object",
            null,
          ],
        }),
      ),
    );

    const employees = await fetchEmployees();

    expect(employees.length).toBeGreaterThan(0);
    expect(
      employees.every(
        (employee) =>
          typeof employee.firstName === "string" &&
          employee.firstName.length > 0,
      ),
    ).toBe(true);
  });

  it("throws an ApiError on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({}, 503)),
    );

    await expect(fetchEmployees()).rejects.toBeInstanceOf(ApiError);
  });

  it("throws an ApiError when no valid users remain", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ users: [] })),
    );

    await expect(fetchEmployees()).rejects.toThrow(/empty dataset/i);
  });
});
