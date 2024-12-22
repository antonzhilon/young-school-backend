import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../../database/supabase.service";

@Injectable()
export class GroupPerformanceService {
  constructor(private readonly supabase: SupabaseService) {}

  async getGroupPerformance(teacherId: string, groupIds: string[]) {
    const { data: students, error } = await this.supabase.client
      .from("user_roles")
      .select(
        `
        user_id,
        users!inner (
          id,
          email
        )
      `
      )
      .eq("role", "student")
      .in("group_id", groupIds);

    if (error) throw error;

    const studentIds = students.map((s) => s.user_id);

    const performanceData = await Promise.all([
      this.getModuleProgress(studentIds),
      this.getTestResults(studentIds),
      this.getTopicMastery(studentIds),
    ]);

    return {
      groupStats: this.aggregateGroupStats(performanceData),
      individualStats: this.mapIndividualStats(students, performanceData),
    };
  }

  private async getModuleProgress(studentIds: string[]) {
    const { data, error } = await this.supabase.client
      .from("user_progress")
      .select("*")
      .in("user_id", studentIds);

    if (error) throw error;
    return data;
  }

  private async getTestResults(studentIds: string[]) {
    const { data, error } = await this.supabase.client
      .from("answers")
      .select("*")
      .in("user_id", studentIds);

    if (error) throw error;
    return data;
  }

  private async getTopicMastery(studentIds: string[]) {
    // Implementation for topic mastery calculation
    return [];
  }

  private aggregateGroupStats(data: any[]) {
    // Implementation for group statistics aggregation
    return {};
  }

  private mapIndividualStats(students: any[], data: any[]) {
    // Implementation for individual statistics mapping
    return [];
  }
}
