import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../../database/supabase.service";

interface InteractionWeight {
  type: string;
  weight: number;
}

@Injectable()
export class InteractionService {
  private readonly weights: InteractionWeight[] = [
    { type: "test_attempt", weight: 2.0 },
    { type: "lesson_view", weight: 1.5 },
    { type: "resource_access", weight: 1.0 },
    { type: "discussion", weight: 1.25 },
  ];

  constructor(private readonly supabase: SupabaseService) {}

  async calculateInteractionScore(userId: string): Promise<number> {
    const { data: interactions, error } = await this.supabase.client
      .from("user_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    if (!interactions.length) return 0;

    const weightedSum = interactions.reduce((sum, interaction) => {
      const weight =
        this.weights.find(
          (w) => w.type === this.getInteractionType(interaction)
        )?.weight || 1;
      return sum + weight;
    }, 0);

    return Math.min(100, Math.round((weightedSum / interactions.length) * 50));
  }

  private getInteractionType(interaction: any): string {
    if (interaction.test_id) return "test_attempt";
    if (interaction.lesson_id) return "lesson_view";
    if (interaction.resource_id) return "resource_access";
    return "discussion";
  }
}
