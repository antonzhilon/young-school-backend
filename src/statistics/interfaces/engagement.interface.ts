export interface EngagementMetrics {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    participationRate: number;
    completionRate: number;
    interactionScore: number;
    consistencyScore: number;
  };
  details: {
    totalSessions: number;
    averageSessionLength: number;
    totalInteractions: number;
    lastEngagement: Date;
  };
  trends: {
    weeklyProgress: number[];
    dailyActivity: number[];
  };
}

export interface InteractionData {
  type: "lesson_view" | "test_attempt" | "resource_access" | "discussion";
  timestamp: Date;
  duration?: number;
  metadata: Record<string, any>;
}
