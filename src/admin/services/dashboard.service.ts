import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import {
  AdminDashboardData,
  AdminStats,
  AdminActivity,
  UserGrowthData,
} from "../interfaces/admin-response.interface";

@Injectable()
export class DashboardService {
  constructor(private readonly supabase: SupabaseService) {}

  async getDashboardData(): Promise<AdminDashboardData> {
    const [stats, recentActivity, userGrowth] = await Promise.all([
      this.getSystemStats(),
      this.getRecentActivity(),
      this.getUserGrowth(),
    ]);

    return {
      stats,
      recentActivity,
      userGrowth,
    };
  }

  async getSystemStats(): Promise<AdminStats> {
    const [{ count: totalUsers }, { count: totalCourses }] = await Promise.all([
      this.supabase.client.from("user_roles").select("*", { count: "exact" }),
      this.supabase.client.from("courses").select("*", { count: "exact" }),
    ]);

    // Get active students using a subquery
    const { data: activeStudents } = await this.supabase.client
      .from("user_progress")
      .select("user_id")
      .gte(
        "last_activity",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      );

    const uniqueActiveStudents = new Set(activeStudents?.map((s) => s.user_id))
      .size;

    const { data: progressData } = await this.supabase.client
      .from("user_progress")
      .select("progress_percentage");

    const completionRate = progressData?.length
      ? progressData.reduce(
          (sum, record) => sum + (record.progress_percentage || 0),
          0
        ) / progressData.length
      : 0;

    return {
      totalUsers: totalUsers || 0,
      totalCourses: totalCourses || 0,
      activeStudents: uniqueActiveStudents,
      completionRate,
      lastUpdated: new Date(),
    };
  }

  async getRecentActivity(): Promise<AdminActivity[]> {
    const { data, error } = await this.supabase.client
      .from("audit_logs")
      .select(
        `
        id,
        user_id,
        action,
        entity_type,
        entity_id,
        changes,
        timestamp
      `
      )
      .order("timestamp", { ascending: false })
      .limit(10);

    if (error) throw error;

    return data.map((log) => ({
      id: log.id,
      userId: log.user_id,
      action: log.action,
      details: `${log.action} ${log.entity_type} (${log.entity_id})`,
      timestamp: new Date(log.timestamp),
    }));
  }

  async getUserGrowth(): Promise<UserGrowthData[]> {
    const { data, error } = await this.supabase.client
      .from("user_roles")
      .select("created_at")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const growthMap = new Map<string, number>();

    data.forEach((record) => {
      const date = new Date(record.created_at).toISOString().split("T")[0];
      growthMap.set(date, (growthMap.get(date) || 0) + 1);
    });

    return Array.from(growthMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }
}
