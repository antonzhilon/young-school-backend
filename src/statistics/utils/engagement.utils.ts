import { InteractionData } from "../interfaces/engagement.interface";
import { DateRangeDto } from "../dto/date-range.dto";

interface EngagementScores {
  participationRate: number;
  completionRate: number;
  interactionScore: number;
  consistencyScore: number;
}

interface EngagementTrends {
  weeklyProgress: number[];
  dailyActivity: number[];
}

export function calculateEngagementScores(
  interactions: InteractionData[],
  progress: any[],
  testAttempts: any[]
): EngagementScores {
  const participationRate = calculateParticipationRate(interactions);
  const completionRate = calculateCompletionRate(progress);
  const interactionScore = calculateInteractionScore(interactions);
  const consistencyScore = calculateConsistencyScore(interactions);

  return {
    participationRate,
    completionRate,
    interactionScore,
    consistencyScore,
  };
}

export function analyzeEngagementTrends(
  interactions: InteractionData[],
  dateRange?: DateRangeDto
): EngagementTrends {
  const startDate = dateRange?.startDate
    ? new Date(dateRange.startDate)
    : new Date(new Date().setDate(new Date().getDate() - 30));

  const endDate = dateRange?.endDate ? new Date(dateRange.endDate) : new Date();

  return {
    weeklyProgress: calculateWeeklyProgress(interactions, startDate, endDate),
    dailyActivity: calculateDailyActivity(interactions, startDate, endDate),
  };
}

function calculateParticipationRate(interactions: InteractionData[]): number {
  const uniqueDays = new Set(
    interactions.map((i) => i.timestamp.toISOString().split("T")[0])
  ).size;

  const totalDays = 30; // Consider last 30 days by default
  return Math.round((uniqueDays / totalDays) * 100);
}

function calculateCompletionRate(progress: any[]): number {
  if (!progress.length) return 0;

  const completionRates = progress.map((p) => p.progress_percentage || 0);
  return Math.round(
    completionRates.reduce((sum, rate) => sum + rate, 0) / progress.length
  );
}

function calculateInteractionScore(interactions: InteractionData[]): number {
  const weights = {
    test_attempt: 2,
    lesson_view: 1.5,
    resource_access: 1,
    discussion: 1.25,
  };

  const weightedSum = interactions.reduce(
    (sum, interaction) => sum + (weights[interaction.type] || 1),
    0
  );

  return Math.min(100, Math.round((weightedSum / interactions.length) * 50));
}

function calculateConsistencyScore(interactions: InteractionData[]): number {
  if (!interactions.length) return 0;

  const dailyInteractions = new Map<string, number>();
  interactions.forEach((interaction) => {
    const day = interaction.timestamp.toISOString().split("T")[0];
    dailyInteractions.set(day, (dailyInteractions.get(day) || 0) + 1);
  });

  const variance = calculateVariance(Array.from(dailyInteractions.values()));
  return Math.round(100 * (1 - Math.min(1, variance / 10)));
}

function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  const squareDiffs = numbers.map((n) => Math.pow(n - mean, 2));
  return Math.sqrt(squareDiffs.reduce((sum, n) => sum + n, 0) / numbers.length);
}

function calculateWeeklyProgress(
  interactions: InteractionData[],
  startDate: Date,
  endDate: Date
): number[] {
  const weeks = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const weeklyData = new Array(weeks).fill(0);

  interactions.forEach((interaction) => {
    const weekIndex = Math.floor(
      (interaction.timestamp.getTime() - startDate.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );
    if (weekIndex >= 0 && weekIndex < weeks) {
      weeklyData[weekIndex]++;
    }
  });

  return weeklyData;
}

function calculateDailyActivity(
  interactions: InteractionData[],
  startDate: Date,
  endDate: Date
): number[] {
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
  );
  const dailyData = new Array(days).fill(0);

  interactions.forEach((interaction) => {
    const dayIndex = Math.floor(
      (interaction.timestamp.getTime() - startDate.getTime()) /
        (24 * 60 * 60 * 1000)
    );
    if (dayIndex >= 0 && dayIndex < days) {
      dailyData[dayIndex]++;
    }
  });

  return dailyData;
}
