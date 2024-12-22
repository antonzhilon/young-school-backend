export interface LearningReport {
  userId: string;
  generatedAt: Date;
  summary: {
    totalTimeSpent: number;
    coursesCompleted: number;
    averageScore: number;
    currentStreak: number;
  };
  strengths: {
    subjects: string[];
    skills: string[];
  };
  improvements: {
    subjects: string[];
    skills: string[];
  };
  recommendations: LearningRecommendation[];
}

export interface LearningRecommendation {
  type: "course" | "practice" | "review";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  reason: string;
  resourceId?: string;
}
