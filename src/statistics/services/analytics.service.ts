import { Injectable } from "@nestjs/common";
import { SupabaseService } from "@/database/supabase.service";
import { UserAnalytics } from "../interfaces/analytics.interface";
import {
  calculateTimeStats,
  analyzeLearningPatterns,
} from "../utils/analytics.utils";

@Injectable()
export class AnalyticsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const { data: sessions, error } = await this.supabase.client
      .from("user_progress")
      .select(
        `
        last_activity,
        duration,
        subject:subject_id (id, name),
        progress_percentage
      `
      )
      .eq("user_id", userId);

    if (error) throw error;

    const timeSpent = calculateTimeStats(sessions);
    const learningPatterns = analyzeLearningPatterns(sessions);

    const { data: testResults } = await this.supabase.client
      .from("answers")
      .select("test_id, is_correct")
      .eq("user_id", userId);

    const { strengthAreas, improvementAreas } =
      this.analyzePerformance(testResults);

    return {
      userId,
      timeSpent,
      learningPatterns,
      strengthAreas,
      improvementAreas,
    };
  }

  private analyzePerformance(testResults: any[]): {
    strengthAreas: string[];
    improvementAreas: string[];
  } {
    const testPerformance = new Map<
      string,
      { correct: number; total: number }
    >();

    testResults.forEach((result) => {
      const current = testPerformance.get(result.test_id) || {
        correct: 0,
        total: 0,
      };
      current.total++;
      if (result.is_correct) current.correct++;
      testPerformance.set(result.test_id, current);
    });

    const performances = Array.from(testPerformance.entries())
      .map(([testId, stats]) => ({
        testId,
        score: (stats.correct / stats.total) * 100,
      }))
      .sort((a, b) => b.score - a.score);

    return {
      strengthAreas: performances.slice(0, 3).map((p) => p.testId),
      improvementAreas: performances.slice(-3).map((p) => p.testId),
    };
  }
}
