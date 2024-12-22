import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../common/enums/user-role.enum";
import { CourseAccessService } from "./course-access.service";
import { GrantAccessDto } from "./dto/grant-access.dto";

@ApiTags("course-access")
@Controller("course-access")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CourseAccessController {
  constructor(private readonly courseAccessService: CourseAccessService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Grant course access to user" })
  grantAccess(@Request() req: AuthenticatedRequest, @Body() grantAccessDto: GrantAccessDto) {
    return this.courseAccessService.grantAccess(req.user.id, grantAccessDto);
  }

  @Delete(":userId/:courseId")
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Revoke course access from user" })
  revokeAccess(
    @Param("userId") userId: string,
    @Param("courseId") courseId: string
  ) {
    return this.courseAccessService.revokeAccess(userId, courseId);
  }

  @Get("verify/:courseId")
  @ApiOperation({ summary: "Verify user access to course" })
  verifyAccess(@Request() req: AuthenticatedRequest, @Param("courseId") courseId: string) {
    return this.courseAccessService.verifyAccess(req.user.id, courseId);
  }

  @Get("user")
  @ApiOperation({ summary: "Get user course access list" })
  getUserAccess(@Request() req: AuthenticatedRequest) {
    return this.courseAccessService.getUserCourseAccess(req.user.id);
  }
}
