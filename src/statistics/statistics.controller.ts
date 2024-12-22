import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthenticatedRequest } from '@/common/interfaces/request.interface';
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { StatisticsService } from "./statistics.service";
import { DateRangeDto } from "./dto/date-range.dto";

@ApiTags("statistics")
@Controller("statistics")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get("course/:courseId")
  @ApiOperation({ summary: "Get course progress statistics" })
  getCourseProgress(@Request() req: AuthenticatedRequest, @Param("courseId") courseId: string) {
    return this.statisticsService.getCourseProgress(courseId, req.user.id);
  }

  @Get("subject/:subjectId")
  @ApiOperation({ summary: "Get subject progress statistics" })
  getSubjectProgress(@Request() req: AuthenticatedRequest, @Param("subjectId") subjectId: string) {
    return this.statisticsService.getSubjectProgress(subjectId, req.user.id);
  }

  @Get("tests")
  @ApiOperation({ summary: "Get test statistics" })
  getTestStats(@Request() req: AuthenticatedRequest, @Query() dateRange: DateRangeDto) {
    return this.statisticsService.getTestStats(dateRange, req.user.id);
  }

  @Get("activity")
  @ApiOperation({ summary: "Get user activity statistics" })
  getActivityStats(@Request() req: AuthenticatedRequest) {
    return this.statisticsService.getActivityStats(req.user.id);
  }
}
