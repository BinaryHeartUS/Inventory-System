export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const datePart = iso.includes("T") ? iso.split("T")[0] : iso;
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
