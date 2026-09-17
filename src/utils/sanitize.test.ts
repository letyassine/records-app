import {
  isValidEmail,
  MAX_TEXT_LENGTH,
  sanitizeEmail,
  sanitizeText,
} from "./sanitize";

describe("sanitizeText", () => {
  it("trims and collapses whitespace", () => {
    expect(sanitizeText("  Jane   Doe  ")).toBe("Jane Doe");
  });

  it("strips disallowed control characters", () => {
    expect(sanitizeText("Ja\u0000ne\u0007\nDoe")).toBe("Jane Doe");
  });

  it("caps the result at the default max length", () => {
    const long = "a".repeat(MAX_TEXT_LENGTH + 50);
    expect(sanitizeText(long)).toHaveLength(MAX_TEXT_LENGTH);
  });

  it("honours a custom max length", () => {
    expect(sanitizeText("abcdef", 3)).toBe("abc");
  });

  it("returns an empty string for blank input", () => {
    expect(sanitizeText("   ")).toBe("");
  });
});

describe("sanitizeEmail", () => {
  it("lowercases, trims and removes internal spaces", () => {
    expect(sanitizeEmail("  Jane Doe@Example.COM ")).toBe(
      "janedoe@example.com",
    );
  });
});

describe("isValidEmail", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("jane.doe+tag@example.com")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmail("nope")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a b@c.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});
