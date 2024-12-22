export enum AchievementType {
  COURSE_COMPLETION = "course_completion",
  TEST_SCORE = "test_score",
  STREAK = "streak",
  LESSON_COMPLETION = "lesson_completion",
}

export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  title: string;
  description: string;
  earnedAt: Date;
  metadata: Record<string, any>;
}

export interface AchievementProgress {
  type: AchievementType;
  current: number;
  required: number;
  percentage: number;
}
