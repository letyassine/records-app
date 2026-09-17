export function cx(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function formatRange(
  page: number,
  pageSize: number,
  total: number,
): string {
  if (total === 0) return "Showing 0 results";
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Showing ${start}–${end} of ${total}`;
}

export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible = 5,
): Array<number | "ellipsis-start" | "ellipsis-end"> {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const result: Array<number | "ellipsis-start" | "ellipsis-end"> = [];
  const sideCount = Math.floor(maxVisible / 2);

  if (currentPage <= sideCount + 2) {
    for (let page = 1; page <= maxVisible - 1; page += 1) result.push(page);
    result.push("ellipsis-end", totalPages);
    return result;
  }

  if (currentPage >= totalPages - sideCount - 1) {
    result.push(1, "ellipsis-start");
    for (
      let page = totalPages - (maxVisible - 2);
      page <= totalPages;
      page += 1
    ) {
      result.push(page);
    }
    return result;
  }

  result.push(1, "ellipsis-start");
  for (
    let page = currentPage - sideCount;
    page <= currentPage + sideCount;
    page += 1
  ) {
    result.push(page);
  }
  result.push("ellipsis-end", totalPages);
  return result;
}
