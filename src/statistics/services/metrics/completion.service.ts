import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../../database/supabase.service";

@Injectable()
export class CompletionService {
  constructor(private readonly supabase: SupabaseService) {}

  async calculateCompletionRate(userId: string): Promise<number> {
    const { data, error } = await this.supabase.client
      .from("user_progress")
      .select("progress_percentage")
      .eq("user_id", userId);

    if (error) throw error;
    if (!data.length) return 0;

    const totalProgress = data.reduce(
      (sum, record) => sum + (record.progress_percentage || 0),
      0
    );

    return Math.round(totalProgress / data.length);
  }

  async getCompletedLessons(userId: string): Promise<number> {
    const { count, error } = await this.supabase.client
      .from("user_progress")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("progress_percentage", 100);

    if (error) throw error;
    return count || 0;
  }
}
