export interface TimeSpentStats {
  totalMinutes: number;
  averageMinutesPerSession: number;
  mostActiveHour: number;
  mostActiveDay: string;
}

export interface LearningPatternStats {
  preferredLearningTime: string;
  averageSessionDuration: number;
  mostCompletedSubjectId: string;
  mostCompletedSubjectName: string;
  completionRate: number;
}

export interface UserAnalytics {
  userId: string;
  timeSpent: TimeSpentStats;
  learningPatterns: LearningPatternStats;
  strengthAreas: string[];
  improvementAreas: string[];
}
