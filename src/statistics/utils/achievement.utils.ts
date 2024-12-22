import { Achievement } from "../interfaces/achievement.interface";

export function validateAchievement(achievement: Partial<Achievement>): void {
  if (!achievement.userId) throw new Error("User ID is required");
  if (!achievement.type) throw new Error("Achievement type is required");
  if (!achievement.title) throw new Error("Achievement title is required");
  if (!achievement.description)
    throw new Error("Achievement description is required");
}

export function formatAchievementDescription(achievement: Achievement): string {
  const { type, metadata } = achievement;

  switch (type) {
    case "course_completion":
      return `Completed course: ${metadata.courseName}`;
    case "test_score":
      return `Achieved ${metadata.score}% on ${metadata.testName}`;
    case "streak":
      return `Maintained a ${metadata.days} day learning streak`;
    default:
      return achievement.description;
  }
}
