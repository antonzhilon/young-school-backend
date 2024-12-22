import {
  TimeSpentStats,
  LearningPatternStats,
} from "../interfaces/analytics.interface";

export function calculateTimeStats(sessions: any[]): TimeSpentStats {
  const totalMinutes = sessions.reduce(
    (sum, session) => sum + (session.duration || 0),
    0
  );
  const sessionHours = sessions.map((s) =>
    new Date(s.last_activity).getHours()
  );

  const hourCounts = new Map<number, number>();
  sessionHours.forEach((hour) => {
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  const mostActiveHour =
    Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

  return {
    totalMinutes,
    averageMinutesPerSession: Math.round(totalMinutes / sessions.length) || 0,
    mostActiveHour,
    mostActiveDay: getMostActiveDay(sessions),
  };
}

export function analyzeLearningPatterns(sessions: any[]): LearningPatternStats {
  const subjectCounts = new Map<
    string,
    { id: string; name: string; count: number }
  >();

  sessions.forEach((session) => {
    const current = subjectCounts.get(session.subject.id) || {
      id: session.subject.id,
      name: session.subject.name,
      count: 0,
    };
    current.count++;
    subjectCounts.set(session.subject.id, current);
  });

  const mostCompleted = Array.from(subjectCounts.values()).sort(
    (a, b) => b.count - a.count
  )[0];

  return {
    preferredLearningTime: getPreferredLearningTime(sessions),
    averageSessionDuration: calculateAverageSessionDuration(sessions),
    mostCompletedSubjectId: mostCompleted?.id || "",
    mostCompletedSubjectName: mostCompleted?.name || "",
    completionRate: calculateCompletionRate(sessions),
  };
}

function getMostActiveDay(sessions: any[]): string {
  const dayCounts = new Map<string, number>();
  sessions.forEach((session) => {
    const day = new Date(session.last_activity).toLocaleDateString("en-US", {
      weekday: "long",
    });
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  });

  return (
    Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || ""
  );
}

function getPreferredLearningTime(sessions: any[]): string {
  const hours = sessions.map((s) => new Date(s.last_activity).getHours());
  const avgHour =
    Math.round(hours.reduce((sum, h) => sum + h, 0) / hours.length) || 0;

  if (avgHour < 12) return "Morning";
  if (avgHour < 17) return "Afternoon";
  return "Evening";
}

function calculateAverageSessionDuration(sessions: any[]): number {
  const durations = sessions.map((s) => s.duration || 0);
  return (
    Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length) || 0
  );
}

function calculateCompletionRate(sessions: any[]): number {
  const completionRates = sessions.map((s) => s.progress_percentage || 0);
  return (
    Math.round(
      completionRates.reduce((sum, r) => sum + r, 0) / completionRates.length
    ) || 0
  );
}
