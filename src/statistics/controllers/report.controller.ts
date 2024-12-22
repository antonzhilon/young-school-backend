import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { ReportService } from "../services/report.service";

@ApiTags("reports")
@Controller("reports")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get("learning")
  @ApiOperation({
    summary: "Generate a detailed learning report with recommendations",
  })
  async getLearningReport(@Request() req: AuthenticatedRequest) {
    return this.reportService.generateReport(req.user.id);
  }
}
