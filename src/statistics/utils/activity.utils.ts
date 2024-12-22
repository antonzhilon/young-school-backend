import { ActivityPeriod } from "../interfaces/activity-stats.interface";

export function calculateStreak(activityDates: Date[]): number {
  if (!activityDates.length) return 0;

  const sortedDates = activityDates
    .map((date) => new Date(date).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);

  let currentStreak = 1;
  const oneDayMs = 24 * 60 * 60 * 1000;

  for (let i = 1; i < sortedDates.length; i++) {
    const diff = sortedDates[i - 1] - sortedDates[i];
    if (diff === oneDayMs) {
      currentStreak++;
    } else {
      break;
    }
  }

  return currentStreak;
}

export function getActivityPeriod(
  activities: Date[],
  startDate: Date,
  endDate: Date
): ActivityPeriod {
  const periodActivities = activities.filter(
    (date) => date >= startDate && date <= endDate
  );

  const uniqueDays = new Set(
    periodActivities.map((date) => new Date(date).setHours(0, 0, 0, 0))
  );

  return {
    startDate,
    endDate,
    totalActiveDays: uniqueDays.size,
    totalSessions: periodActivities.length,
  };
}
