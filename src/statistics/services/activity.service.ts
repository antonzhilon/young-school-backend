import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { UserActivityStats } from "../interfaces/activity-stats.interface";
import { calculateStreak, getActivityPeriod } from "../utils/activity.utils";

@Injectable()
export class ActivityService {
  constructor(private readonly supabase: SupabaseService) {}

  async getUserActivity(userId: string): Promise<UserActivityStats> {
    const { data: activities, error } = await this.supabase.client
      .from("user_progress")
      .select("last_activity")
      .eq("user_id", userId)
      .order("last_activity", { ascending: false });

    if (error) throw error;

    const activityDates = activities.map((a) => new Date(a.last_activity));
    const now = new Date();
    const lastActive = activityDates[0] || now;

    // Calculate periods
    const daily = getActivityPeriod(
      activityDates,
      new Date(now.setDate(now.getDate() - 1)),
      new Date()
    );

    const weekly = getActivityPeriod(
      activityDates,
      new Date(now.setDate(now.getDate() - 7)),
      new Date()
    );

    const monthly = getActivityPeriod(
      activityDates,
      new Date(now.setMonth(now.getMonth() - 1)),
      new Date()
    );

    const currentStreak = calculateStreak(activityDates);
    const allStreaks = this.calculateAllStreaks(activityDates);
    const longestStreak = Math.max(...allStreaks, 0);

    return {
      userId,
      lastActive,
      currentStreak,
      longestStreak,
      periods: {
        daily,
        weekly,
        monthly,
      },
    };
  }

  private calculateAllStreaks(dates: Date[]): number[] {
    if (!dates.length) return [0];

    const sortedDates = dates
      .map((date) => new Date(date).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a);

    const streaks: number[] = [];
    let currentStreak = 1;
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let i = 1; i < sortedDates.length; i++) {
      const diff = sortedDates[i - 1] - sortedDates[i];

      if (diff === oneDayMs) {
        currentStreak++;
      } else {
        streaks.push(currentStreak);
        currentStreak = 1;
      }
    }

    streaks.push(currentStreak);
    return streaks;
  }
}
