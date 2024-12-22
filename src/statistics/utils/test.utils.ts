import { TestStats } from "../interfaces/test-stats.interface";

export function calculateTestStatistics(
  attempts: number,
  correct: number
): Pick<TestStats, "averageScore" | "bestScore"> {
  if (attempts === 0) {
    return { averageScore: 0, bestScore: 0 };
  }

  const averageScore = Math.round((correct / attempts) * 100);
  const bestScore = Math.max(averageScore, 0);

  return { averageScore, bestScore };
}

export function validateTestAttempt(correct: number, total: number): void {
  if (correct < 0) throw new Error("Correct answers cannot be negative");
  if (total < 0) throw new Error("Total attempts cannot be negative");
  if (correct > total)
    throw new Error("Correct answers cannot exceed total attempts");
}
