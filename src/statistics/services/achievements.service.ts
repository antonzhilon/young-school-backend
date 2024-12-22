import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import {
  Achievement,
  AchievementType,
  AchievementProgress,
} from "../interfaces/achievement.interface";
import { validateAchievement } from "../utils/achievement.utils";

@Injectable()
export class AchievementsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await this.supabase.client
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (error) throw error;
    return data.map((achievement) => ({
      ...achievement,
      earnedAt: new Date(achievement.earned_at),
      metadata: JSON.parse(achievement.metadata || "{}"),
    }));
  }

  async getAchievementProgress(userId: string): Promise<AchievementProgress[]> {
    const progress: AchievementProgress[] = [];

    // Course completion progress
    const { data: courseProgress } = await this.supabase.client
      .from("user_progress")
      .select("progress_percentage")
      .eq("user_id", userId);

    if (courseProgress?.length) {
      const avgProgress =
        courseProgress.reduce((sum, p) => sum + p.progress_percentage, 0) /
        courseProgress.length;
      progress.push({
        type: AchievementType.COURSE_COMPLETION,
        current: avgProgress,
        required: 100,
        percentage: avgProgress,
      });
    }

    // Add other achievement progress calculations...

    return progress;
  }
}
