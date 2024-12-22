import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-role.enum";
import { UserAdminService } from "../services/user.admin.service";
import { AdminUpdateUserDto } from "../dto/user/update-user.admin.dto";
import { AdminUserFilterDto } from "../dto/user/user-filter.admin.dto";

@ApiTags("admin-users")
@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class UserAdminController {
  constructor(private readonly userAdminService: UserAdminService) {}

  @Get()
  @ApiOperation({ summary: "Get all users with filtering" })
  findAll(@Query() filters: AdminUserFilterDto) {
    return this.userAdminService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user details by ID" })
  findOne(@Param("id") id: string) {
    return this.userAdminService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user details" })
  update(@Param("id") id: string, @Body() updateUserDto: AdminUpdateUserDto) {
    return this.userAdminService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deactivate user" })
  deactivate(@Param("id") id: string) {
    return this.userAdminService.deactivate(id);
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get user statistics" })
  getStats(@Param("id") id: string) {
    return this.userAdminService.getUserStats(id);
  }

  @Get(":id/activity")
  @ApiOperation({ summary: "Get user activity history" })
  getActivity(@Param("id") id: string) {
    return this.userAdminService.getUserActivity(id);
  }
}
