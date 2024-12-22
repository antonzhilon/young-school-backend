import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { Roles } from "@/auth/decorators/roles.decorator";
import { UserRole } from "@/common/enums/user-role.enum";
import { AdminService } from "./admin.service";

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  @ApiOperation({ summary: "Get all users with their roles" })
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get("statistics")
  @ApiOperation({ summary: "Get system-wide statistics" })
  getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get("audit-logs")
  @ApiOperation({ summary: "Get system audit logs" })
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
