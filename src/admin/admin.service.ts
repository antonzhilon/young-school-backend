import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../database/supabase.service";

@Injectable()
export class AdminService {
  constructor(private readonly supabase: SupabaseService) {}

  async getAllUsers() {
    const { data, error } = await this.supabase.client.from("user_roles")
      .select(`
        user_id,
        role,
        users!inner (
          email,
          created_at
        )
      `);

    if (error) throw error;
    return data;
  }

  async getSystemStats() {
    const [usersCount, coursesCount, activeStudents, completionRate] =
      await Promise.all([
        this.getUsersCount(),
        this.getCoursesCount(),
        this.getActiveStudentsCount(),
        this.getOverallCompletionRate(),
      ]);

    return {
      usersCount,
      coursesCount,
      activeStudents,
      completionRate,
      lastUpdated: new Date(),
    };
  }

  async getAuditLogs() {
    return [];
  }

  private async getUsersCount() {
    const { count } = await this.supabase.client
      .from("user_roles")
      .select("*", { count: "exact" });
    return count;
  }

  private async getCoursesCount() {
    const { count } = await this.supabase.client
      .from("courses")
      .select("*", { count: "exact" });
    return count;
  }

  private async getActiveStudentsCount() {
    // Using a subquery to get distinct count
    const { data } = await this.supabase.client
      .from("user_progress")
      .select("user_id")
      .gte(
        "last_activity",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      )
      .limit(1000); // Add reasonable limit

    return new Set(data?.map((d) => d.user_id)).size;
  }

  private async getOverallCompletionRate() {
    const { data } = await this.supabase.client
      .from("user_progress")
      .select("progress_percentage");

    if (!data?.length) return 0;

    return (
      data.reduce((sum, record) => sum + (record.progress_percentage || 0), 0) /
      data.length
    );
  }
}
