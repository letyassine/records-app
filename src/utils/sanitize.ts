const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MAX_TEXT_LENGTH = 120;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export function sanitizeEmail(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "");
}

export function sanitizeText(
  input: string,
  maxLength = MAX_TEXT_LENGTH,
): string {
  let cleaned = "";
  for (const character of input) {
    const code = character.codePointAt(0) ?? 0;
    const isDisallowedControl =
      code <= 8 ||
      code === 11 ||
      code === 12 ||
      (code >= 14 && code <= 31) ||
      code === 127;
    if (!isDisallowedControl) cleaned += character;
  }
  return cleaned.replace(/\s+/g, " ").trim().slice(0, maxLength);
}
