export interface ActivityPeriod {
  startDate: Date;
  endDate: Date;
  totalActiveDays: number;
  totalSessions: number;
}

export interface UserActivityStats {
  userId: string;
  lastActive: Date;
  currentStreak: number;
  longestStreak: number;
  periods: {
    daily: ActivityPeriod;
    weekly: ActivityPeriod;
    monthly: ActivityPeriod;
  };
}
