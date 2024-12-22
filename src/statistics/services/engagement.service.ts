import { Injectable } from "@nestjs/common";
import { SupabaseService } from "@/database/supabase.service";
import {
  ParticipationService,
  CompletionService,
  InteractionService,
  ConsistencyService,
} from "./metrics";
import { EngagementMetrics } from "../interfaces/engagement.interface";
import { DateRangeDto } from "../dto/date-range.dto";

@Injectable()
export class EngagementService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly participationService: ParticipationService,
    private readonly completionService: CompletionService,
    private readonly interactionService: InteractionService,
    private readonly consistencyService: ConsistencyService
  ) {}

  // Rest of the service implementation...
}
