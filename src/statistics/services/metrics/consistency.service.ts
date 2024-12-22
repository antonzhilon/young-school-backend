import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../../database/supabase.service";

@Injectable()
export class ConsistencyService {
  constructor(private readonly supabase: SupabaseService) {}

  async calculateConsistencyScore(userId: string): Promise<number> {
    const { data, error } = await this.supabase.client
      .from("user_progress")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data.length) return 0;

    const dailyInteractions = this.groupByDay(data);
    const variance = this.calculateVariance(
      Array.from(dailyInteractions.values())
    );

    return Math.round(100 * (1 - Math.min(1, variance / 10)));
  }

  private groupByDay(data: any[]): Map<string, number> {
    const dailyInteractions = new Map<string, number>();

    data.forEach((record) => {
      const day = new Date(record.created_at).toISOString().split("T")[0];
      dailyInteractions.set(day, (dailyInteractions.get(day) || 0) + 1);
    });

    return dailyInteractions;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squareDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return Math.sqrt(
      squareDiffs.reduce((sum, n) => sum + n, 0) / numbers.length
    );
  }
}
