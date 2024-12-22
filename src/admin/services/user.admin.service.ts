import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { AdminUpdateUserDto } from "../dto/user/update-user.admin.dto";
import { AdminUserFilterDto } from "../dto/user/user-filter.admin.dto";
import { AdminPaginatedResponse } from "../interfaces/admin-response.interface";
import {
  AdminUserDetails,
  AdminUserStats,
} from "../interfaces/user.admin.interface";

@Injectable()
export class UserAdminService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(
    filters: AdminUserFilterDto
  ): Promise<AdminPaginatedResponse<AdminUserDetails>> {
    let query = this.supabase.client.from("user_roles").select(
      `
        user_id,
        role,
        users!inner (
          email,
          created_at,
          last_sign_in_at
        )
      `,
      { count: "exact" }
    );

    if (filters.email) {
      query = query.ilike("users.email", `%${filters.email}%`);
    }
    if (filters.role) {
      query = query.eq("role", filters.role);
    }

    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;

    if (filters.sortBy) {
      query = query.order(filters.sortBy, {
        ascending: filters.sortDirection === "asc",
      });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const userDetails = await Promise.all(
      data.map(async (user) => {
        const [coursesEnrolled, coursesCompleted] = await Promise.all([
          this.getEnrolledCoursesCount(user.user_id),
          this.getCompletedCoursesCount(user.user_id),
        ]);

        return {
          id: user.user_id,
          email: user.users.email,
          role: user.role,
          isActive: true, // You might want to add an is_active column to your users table
          createdAt: new Date(user.users.created_at),
          lastSignIn: user.users.last_sign_in_at
            ? new Date(user.users.last_sign_in_at)
            : undefined,
          coursesEnrolled,
          coursesCompleted,
        };
      })
    );

    const totalPages = Math.ceil((count || 0) / filters.limit);

    return {
      data: userDetails,
      meta: {
        total: count || 0,
        page: filters.page,
        lastPage: totalPages,
        hasNextPage: filters.page < totalPages,
      },
    };
  }

  async findOne(id: string): Promise<AdminUserDetails> {
    const { data, error } = await this.supabase.client
      .from("user_roles")
      .select(
        `
        user_id,
        role,
        users!inner (
          email,
          created_at,
          last_sign_in_at
        )
      `
      )
      .eq("user_id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("User not found");

    const [coursesEnrolled, coursesCompleted] = await Promise.all([
      this.getEnrolledCoursesCount(id),
      this.getCompletedCoursesCount(id),
    ]);

    return {
      id: data.user_id,
      email: data.users.email,
      role: data.role,
      isActive: true,
      createdAt: new Date(data.users.created_at),
      lastSignIn: data.users.last_sign_in_at
        ? new Date(data.users.last_sign_in_at)
        : undefined,
      coursesEnrolled,
      coursesCompleted,
    };
  }

  async update(
    id: string,
    updateUserDto: AdminUpdateUserDto
  ): Promise<AdminUserDetails> {
    const { data, error } = await this.supabase.client
      .from("user_roles")
      .update({ role: updateUserDto.role })
      .eq("user_id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("User not found");

    return this.findOne(id);
  }

  async deactivate(id: string): Promise<void> {
    const { error } = await this.supabase.client.auth.admin.deleteUser(id);
    if (error) throw error;
  }

  async getUserStats(id: string): Promise<AdminUserStats> {
    const [loginCount, lastActivity, completionRate, activeStreak] =
      await Promise.all([
        this.getLoginCount(id),
        this.getLastActivity(id),
        this.getCompletionRate(id),
        this.getActiveStreak(id),
      ]);

    return {
      totalLogins: loginCount,
      averageSessionDuration: await this.getAverageSessionDuration(id),
      lastActivity,
      completionRate,
      activeStreak,
    };
  }

  async getUserActivity(id: string) {
    const { data, error } = await this.supabase.client
      .from("learning_activities")
      .select("*")
      .eq("student_id", id)
      .order("timestamp", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }

  private async getEnrolledCoursesCount(userId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("course_access")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    return count || 0;
  }

  private async getCompletedCoursesCount(userId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("user_progress")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("progress_percentage", 100);

    return count || 0;
  }

  private async getLoginCount(userId: string): Promise<number> {
    // Implementation depends on how you track logins
    return 0;
  }

  private async getLastActivity(userId: string): Promise<Date> {
    const { data } = await this.supabase.client
      .from("user_progress")
      .select("last_activity")
      .eq("user_id", userId)
      .order("last_activity", { ascending: false })
      .limit(1);

    return data?.[0]?.last_activity
      ? new Date(data[0].last_activity)
      : new Date();
  }

  private async getCompletionRate(userId: string): Promise<number> {
    const { data } = await this.supabase.client
      .from("user_progress")
      .select("progress_percentage")
      .eq("user_id", userId);

    if (!data?.length) return 0;
    return (
      data.reduce((sum, record) => sum + (record.progress_percentage || 0), 0) /
      data.length
    );
  }

  private async getActiveStreak(userId: string): Promise<number> {
    // Implementation depends on how you track activity streaks
    return 0;
  }

  private async getAverageSessionDuration(userId: string): Promise<number> {
    // Implementation depends on how you track session duration
    return 0;
  }
}
