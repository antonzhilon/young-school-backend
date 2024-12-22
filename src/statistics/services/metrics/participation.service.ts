import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../../database/supabase.service";

@Injectable()
export class ParticipationService {
  constructor(private readonly supabase: SupabaseService) {}

  async calculateParticipationRate(
    userId: string,
    days: number = 30
  ): Promise<number> {
    const { data, error } = await this.supabase.client
      .from("user_progress")
      .select("created_at")
      .eq("user_id", userId)
      .gte(
        "created_at",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      );

    if (error) throw error;

    const uniqueDays = new Set(
      data.map(
        (record) => new Date(record.created_at).toISOString().split("T")[0]
      )
    ).size;

    return Math.round((uniqueDays / days) * 100);
  }
}
