import type { Employee, EmployeeStatus } from "../types/employee";
import { DEPARTMENTS, ROLES } from "../types/employee";

const API_URL = import.meta.env.VITE_EMPLOYEE_API_URL as string | undefined;
const RECORD_COUNT = Number(import.meta.env.VITE_RECORD_COUNT ?? 1500);

const DEFAULT_ENDPOINT =
  "https://dummyjson.com/users?limit=0&select=id,firstName,lastName,email";

interface RemoteUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface RemoteResponse {
  users: RemoteUser[];
}

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRemoteUsers(input: unknown): RemoteUser[] {
  if (!Array.isArray(input)) return [];

  const users: RemoteUser[] = [];
  input.forEach((entry, index) => {
    if (entry === null || typeof entry !== "object") return;
    const record = entry as Record<string, unknown>;
    const firstName = toTrimmedString(record.firstName);
    const lastName = toTrimmedString(record.lastName);
    const email = toTrimmedString(record.email);
    if (!firstName || !lastName || !email) return;

    const rawId = record.id;
    const id =
      typeof rawId === "number" && Number.isFinite(rawId) ? rawId : index + 1;
    users.push({ id, firstName, lastName, email });
  });
  return users;
}

export const EMPLOYEE_QUERY_KEY = ["employees"] as const;

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function mulberry32(seed: number): () => number {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: readonly T[], rand: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(rand() * items.length))];
}

function deriveEmployee(index: number, seed: RemoteUser): Employee {
  const rand = mulberry32((seed.id * 31 + index) % 2 ** 31);
  return {
    id: index + 1,
    firstName: seed.firstName,
    lastName: seed.lastName,
    email: seed.email,
    department: pick(DEPARTMENTS, rand),
    role: pick(ROLES, rand),
    status: pick(
      ["active", "active", "active", "inactive", "on_leave"],
      rand,
    ) as EmployeeStatus,
  };
}

const RECORD_COUNT_IS_SAFE =
  Number.isInteger(RECORD_COUNT) && RECORD_COUNT >= 50 && RECORD_COUNT <= 20000;

export async function fetchEmployees(
  signal?: AbortSignal,
): Promise<Employee[]> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10_000);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener("abort", onExternalAbort, { once: true });

  try {
    const endpoint = API_URL ?? DEFAULT_ENDPOINT;
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(
        `Could not load employees (HTTP ${response.status}).`,
        response.status,
      );
    }

    const payload = (await response.json()) as RemoteResponse;
    const seeds = normalizeRemoteUsers(payload?.users);
    if (seeds.length === 0) {
      throw new ApiError("The employees API returned an empty dataset.");
    }
    const targetCount = RECORD_COUNT_IS_SAFE ? RECORD_COUNT : seeds.length;
    const employees = Array.from({ length: targetCount }, (_, index) =>
      deriveEmployee(index, seeds[index % seeds.length]),
    );
    return employees;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      if (signal?.aborted) throw error;
      throw new ApiError("The request timed out. Please try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", onExternalAbort);
  }
}
