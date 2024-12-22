import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { EngagementService } from "../services/engagement.service";
import { DateRangeDto } from "../dto/date-range.dto";
import {AuthenticatedRequest} from "@/common/interfaces/request.interface";

@ApiTags("engagement")
@Controller("engagement")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get("metrics")
  @ApiOperation({ summary: "Get detailed engagement metrics for a user" })
  async getEngagementMetrics(@Request() req: AuthenticatedRequest, @Query() dateRange: DateRangeDto) {
    return this.engagementService.getEngagementMetrics(req.user.id, dateRange);
  }
}
