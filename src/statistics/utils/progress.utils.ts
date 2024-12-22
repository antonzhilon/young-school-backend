export function calculateProgressPercentage(
  completed: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function validateProgress(completed: number, total: number): void {
  if (completed < 0) throw new Error("Completed count cannot be negative");
  if (total < 0) throw new Error("Total count cannot be negative");
  if (completed > total) throw new Error("Completed count cannot exceed total");
}
