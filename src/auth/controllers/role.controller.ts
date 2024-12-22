import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-role.enum";
import { RoleService } from "../services/role.service";

@ApiTags("roles")
@Controller("roles")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post(":userId")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Assign role to user" })
  assignRole(@Param("userId") userId: string, @Body("role") role: UserRole) {
    return this.roleService.assignRole(userId, role);
  }

  @Delete(":userId")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Remove role from user" })
  removeRole(@Param("userId") userId: string, @Body("role") role: UserRole) {
    return this.roleService.removeRole(userId, role);
  }
}
