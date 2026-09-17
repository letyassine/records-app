const FORMULA_PREFIX = /^\s*[=+\-@\t\r\n]/;

export type CsvRow = Array<string | number>;

export function sanitizeCsvCell(
  value: string | number,
  quoteAll = false,
): string {
  const raw = typeof value === "number" ? String(value) : value;
  const safe = FORMULA_PREFIX.test(raw) ? `'${raw}` : raw;

  const needsQuoting =
    quoteAll || /[",\n\r]|^\s|\s$/.test(safe) || /^".*"$/.test(safe);

  return needsQuoting ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(header: CsvRow, rows: CsvRow[]): string {
  const lines = [header, ...rows].map((cells) =>
    cells.map((cell) => sanitizeCsvCell(cell)).join(","),
  );
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

function triggerDownload(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(
  filename: string,
  header: CsvRow,
  rows: CsvRow[],
): void {
  if (rows.length === 0) return;
  triggerDownload(filename, toCsv(header, rows), "text/csv");
}

export function downloadJson(filename: string, payload: unknown): void {
  triggerDownload(
    filename,
    JSON.stringify(payload, null, 2),
    "application/json",
  );
}
