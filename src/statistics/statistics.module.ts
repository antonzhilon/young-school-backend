import { Module } from "@nestjs/common";
import { StatisticsController } from "./statistics.controller";
import { StatisticsService } from "./statistics.service";
import { EngagementService } from "./services/engagement.service";
import {
  ParticipationService,
  CompletionService,
  InteractionService,
  ConsistencyService,
} from "./services/metrics";
import { SupabaseService } from "@/database/supabase.service";

@Module({
  controllers: [StatisticsController],
  providers: [
    StatisticsService,
    EngagementService,
    ParticipationService,
    CompletionService,
    InteractionService,
    ConsistencyService,
    SupabaseService,
  ],
  exports: [StatisticsService],
})
export class StatisticsModule {}
