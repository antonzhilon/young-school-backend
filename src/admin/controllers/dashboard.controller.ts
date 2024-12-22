import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-role.enum";
import { DashboardService } from "../services/dashboard.service";
import {
  AdminDashboardData,
  AdminStats,
  AdminActivity,
  UserGrowthData,
} from "../interfaces/admin-response.interface";

@ApiTags("admin-dashboard")
@Controller("admin/dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: "Get admin dashboard data" })
  async getDashboardData(): Promise<AdminDashboardData> {
    return this.dashboardService.getDashboardData();
  }

  @Get("stats")
  @ApiOperation({ summary: "Get system statistics" })
  async getSystemStats(): Promise<AdminStats> {
    return this.dashboardService.getSystemStats();
  }

  @Get("activity")
  @ApiOperation({ summary: "Get recent system activity" })
  async getRecentActivity(): Promise<AdminActivity[]> {
    return this.dashboardService.getRecentActivity();
  }

  @Get("growth")
  @ApiOperation({ summary: "Get user growth data" })
  async getUserGrowth(): Promise<UserGrowthData[]> {
    return this.dashboardService.getUserGrowth();
  }
}
