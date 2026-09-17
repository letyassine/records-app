import { formatRange, getPageNumbers } from "./helpers";

describe("formatRange", () => {
  it("reports zero results", () => {
    expect(formatRange(1, 10, 0)).toBe("Showing 0 results");
  });

  it("computes the visible window for a middle page", () => {
    expect(formatRange(2, 10, 35)).toBe("Showing 11–20 of 35");
  });

  it("clamps the end on the last page", () => {
    expect(formatRange(4, 10, 35)).toBe("Showing 31–35 of 35");
  });
});

describe("getPageNumbers", () => {
  it("lists every page when they fit", () => {
    expect(getPageNumbers(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it("adds a trailing ellipsis near the start", () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, 4, "ellipsis-end", 10]);
  });

  it("adds a leading ellipsis near the end", () => {
    expect(getPageNumbers(10, 10)).toEqual([1, "ellipsis-start", 7, 8, 9, 10]);
  });

  it("adds both ellipses around the current page", () => {
    expect(getPageNumbers(5, 10)).toEqual([
      1,
      "ellipsis-start",
      3,
      4,
      5,
      6,
      7,
      "ellipsis-end",
      10,
    ]);
  });
});
