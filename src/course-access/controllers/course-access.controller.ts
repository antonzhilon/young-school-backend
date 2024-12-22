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
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { Roles } from "@/auth/decorators/roles.decorator";
import { UserRole } from "@/common/enums/user-role.enum";
import { CourseAccessService } from "../services/course-access.service";
import { GrantAccessDto } from "../dto/grant-access.dto";
import { RevokeAccessDto } from "../dto/revoke-access.dto";
import {AuthenticatedRequest} from "@/common/interfaces/request.interface";

@ApiTags("course-access")
@Controller("course-access")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CourseAccessController {
  constructor(private readonly courseAccessService: CourseAccessService) {}

  @Post("grant")
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Grant course access to students" })
  grantAccess(@Request() req: AuthenticatedRequest, @Body() grantAccessDto: GrantAccessDto) {
    return this.courseAccessService.grantAccess(req.user.id, grantAccessDto);
  }

  @Post("revoke")
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Revoke course access from students" })
  revokeAccess(@Body() revokeAccessDto: RevokeAccessDto) {
    return this.courseAccessService.revokeAccess(revokeAccessDto);
  }

  @Get("verify/:courseId")
  @ApiOperation({ summary: "Verify user access to course" })
  verifyAccess(@Request() req: AuthenticatedRequest, @Param("courseId") courseId: string) {
    return this.courseAccessService.verifyAccess(req.user.id, courseId);
  }

  @Get("courses")
  @ApiOperation({ summary: "Get user course access list" })
  getUserAccess(@Request() req: AuthenticatedRequest) {
    return this.courseAccessService.getUserCourseAccess(req.user.id);
  }

  @Get("students/:courseId")
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Get students with access to course" })
  getCourseStudents(@Param("courseId") courseId: string) {
    return this.courseAccessService.getCourseStudents(courseId);
  }
}
