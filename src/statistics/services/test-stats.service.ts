import { Injectable } from "@nestjs/common";
import { SupabaseService } from "@/database/supabase.service";
import { TestStats, UserTestStats } from "../interfaces/test-stats.interface";
import { DateRangeDto } from "../dto/date-range.dto";
import { validateDateRange } from "../utils/date.utils";
import {
  calculateTestStatistics,
  validateTestAttempt,
} from "../utils/test.utils";

@Injectable()
export class TestStatsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getUserTestStats(
    userId: string,
    dateRange?: DateRangeDto
  ): Promise<UserTestStats> {
    const validatedDateRange = validateDateRange(dateRange);

    let query = this.supabase.client
      .from("answers")
      .select(
        `
        test_id,
        tests (name),
        is_correct,
        created_at
      `
      )
      .eq("user_id", userId);

    if (validatedDateRange.startDate) {
      query = query.gte("created_at", validatedDateRange.startDate);
    }
    if (validatedDateRange.endDate) {
      query = query.lte("created_at", validatedDateRange.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const testStats = this.processTestStats(data);

    return {
      userId,
      tests: testStats,
    };
  }

  private processTestStats(answers: any[]): TestStats[] {
    const testMap = new Map<string, TestStats>();

    answers.forEach((answer) => {
      const testId = answer.test_id;
      const current = testMap.get(testId) || {
        testId,
        testName: answer.tests.name,
        totalAttempts: 0,
        correctAnswers: 0,
        averageScore: 0,
        bestScore: 0,
        lastAttemptDate: new Date(0),
      };

      current.totalAttempts++;
      if (answer.is_correct) current.correctAnswers++;

      validateTestAttempt(current.correctAnswers, current.totalAttempts);

      const stats = calculateTestStatistics(
        current.totalAttempts,
        current.correctAnswers
      );
      current.averageScore = stats.averageScore;
      current.bestScore = stats.bestScore;

      current.lastAttemptDate = new Date(
        Math.max(
          current.lastAttemptDate.getTime(),
          new Date(answer.created_at).getTime()
        )
      );

      testMap.set(testId, current);
    });

    return Array.from(testMap.values());
  }
}
