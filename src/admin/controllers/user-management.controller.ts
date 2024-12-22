import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-role.enum";
import { UserManagementService } from "../services/user-management.service";
import { UpdateUserDto } from "../dto/update-user.dto";

@ApiTags("admin-users")
@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @ApiOperation({ summary: "Get all users with their roles and status" })
  getAllUsers() {
    return this.userManagementService.getAllUsers();
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user details" })
  updateUser(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userManagementService.updateUser(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deactivate user" })
  deactivateUser(@Param("id") id: string) {
    return this.userManagementService.deactivateUser(id);
  }
}
