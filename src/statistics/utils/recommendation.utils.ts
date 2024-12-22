import { SupabaseClient } from "@supabase/supabase-js";
import { LearningRecommendation } from "../interfaces/report.interface";
import { UserAnalytics } from "../interfaces/analytics.interface";
import { UserTestStats } from "../interfaces/test-stats.interface";

export async function generateRecommendations(
  userId: string,
  analytics: UserAnalytics,
  testStats: UserTestStats,
  supabase: SupabaseClient
): Promise<LearningRecommendation[]> {
  const recommendations: LearningRecommendation[] = [];

  // Recommend practice for weak areas
  for (const area of analytics.improvementAreas) {
    const { data: relatedCourses } = await supabase
      .from("courses")
      .select("id, name, description")
      .eq("subject_id", area)
      .limit(1);

    if (relatedCourses?.[0]) {
      recommendations.push({
        type: "course",
        priority: "high",
        title: `Improve ${relatedCourses[0].name}`,
        description: relatedCourses[0].description || "",
        reason: "This area needs improvement based on your test results",
        resourceId: relatedCourses[0].id,
      });
    }
  }

  // Recommend review for tests with low scores
  const lowScoreTests = testStats.tests.filter(
    (test) => test.averageScore < 60
  );
  for (const test of lowScoreTests.slice(0, 2)) {
    recommendations.push({
      type: "review",
      priority: "medium",
      title: `Review ${test.testName}`,
      description: "Practice these concepts to improve your understanding",
      reason: `Your score (${test.averageScore}%) indicates room for improvement`,
      resourceId: test.testId,
    });
  }

  // Recommend practice based on learning patterns
  if (analytics.learningPatterns.completionRate < 70) {
    recommendations.push({
      type: "practice",
      priority: "medium",
      title: "Regular Practice Sessions",
      description: "Set aside time for daily practice",
      reason: "Consistent practice will help improve your completion rate",
    });
  }

  return recommendations;
}

export function prioritizeRecommendations(
  recommendations: LearningRecommendation[]
): LearningRecommendation[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}
