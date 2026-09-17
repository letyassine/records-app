import {
  downloadCsv,
  downloadJson,
  sanitizeCsvCell,
  toCsv,
} from "./exportUtils";

describe("sanitizeCsvCell", () => {
  it("neutralizes formula prefixes", () => {
    expect(sanitizeCsvCell("=1+1")).toBe("'=1+1");
    expect(sanitizeCsvCell("+SUM(A1)")).toBe("'+SUM(A1)");
    expect(sanitizeCsvCell("@cmd")).toBe("'@cmd");
    expect(sanitizeCsvCell("-2")).toBe("'-2");
  });

  it("neutralizes formulas hidden behind leading whitespace", () => {
    expect(sanitizeCsvCell(" =1+1")).toBe("' =1+1");
  });

  it("quotes cells containing separators and escapes quotes", () => {
    expect(sanitizeCsvCell("a,b")).toBe('"a,b"');
    expect(sanitizeCsvCell('He said "hi"')).toBe('"He said ""hi"""');
    expect(sanitizeCsvCell("line\nbreak")).toBe('"line\nbreak"');
  });

  it("quotes on request and preserves ordinary values", () => {
    expect(sanitizeCsvCell("plain", true)).toBe('"plain"');
    expect(sanitizeCsvCell("Jane")).toBe("Jane");
    expect(sanitizeCsvCell(42)).toBe("42");
  });
});

describe("toCsv", () => {
  it("prefixes a BOM and joins rows with CRLF", () => {
    const csv = toCsv(["A", "B"], [["1", "2"]]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toBe("\uFEFFA,B\r\n1,2\r\n");
  });
});

describe("download helpers", () => {
  const createObjectURL = vi.fn(() => "blob:mock");

  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      writable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  it("does nothing when there are no rows", () => {
    downloadCsv("empty.csv", ["A"], []);
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("creates an object URL for CSV export", () => {
    downloadCsv("employees.csv", ["A"], [["1"]]);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
  });

  it("creates an object URL for JSON export", () => {
    downloadJson("employees.json", [{ id: 1 }]);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
  });
});
