import { Injectable } from "@nestjs/common";
import { SupabaseService } from "@/database/supabase.service";
import {
  LearningReport,
  LearningRecommendation,
} from "../interfaces/report.interface";
import { AnalyticsService } from "./analytics.service";
import { TestStatsService } from "./test-stats.service";
import { ActivityService } from "./activity.service";
import { generateRecommendations } from "../utils/recommendation.utils";

@Injectable()
export class ReportService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly analyticsService: AnalyticsService,
    private readonly testStatsService: TestStatsService,
    private readonly activityService: ActivityService
  ) {}

  async generateReport(userId: string): Promise<LearningReport> {
    const [analytics, testStats, activity] = await Promise.all([
      this.analyticsService.getUserAnalytics(userId),
      this.testStatsService.getUserTestStats(userId),
      this.activityService.getUserActivity(userId),
    ]);

    const { data: completedCourses } = await this.supabase.client
      .from("user_progress")
      .select("course_id")
      .eq("user_id", userId)
      .eq("progress_percentage", 100);

    const averageScore =
      testStats.tests.reduce((sum, test) => sum + test.averageScore, 0) /
      (testStats.tests.length || 1);

    const recommendations = await generateRecommendations(
      userId,
      analytics,
      testStats,
      this.supabase.client
    );

    return {
      userId,
      generatedAt: new Date(),
      summary: {
        totalTimeSpent: analytics.timeSpent.totalMinutes,
        coursesCompleted: completedCourses?.length || 0,
        averageScore,
        currentStreak: activity.currentStreak,
      },
      strengths: {
        subjects: analytics.strengthAreas,
        skills: this.identifyStrengths(testStats),
      },
      improvements: {
        subjects: analytics.improvementAreas,
        skills: this.identifyImprovements(testStats),
      },
      recommendations,
    };
  }

  private identifyStrengths(testStats: any): string[] {
    return testStats.tests
      .filter((test) => test.averageScore >= 80)
      .map((test) => test.testName)
      .slice(0, 3);
  }

  private identifyImprovements(testStats: any): string[] {
    return testStats.tests
      .filter((test) => test.averageScore < 60)
      .map((test) => test.testName)
      .slice(0, 3);
  }
}
