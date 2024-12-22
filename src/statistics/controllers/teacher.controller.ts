import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-role.enum";
import { GroupPerformanceService } from "../services/teacher/group-performance.service";
import { StudentDetailService } from "../services/teacher/student-detail.service";
import { StudentGroupService } from "../services/teacher/student-group.service";

@ApiTags("teacher-statistics")
@Controller("teacher/statistics")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
@ApiBearerAuth()
export class TeacherStatisticsController {
  constructor(
    private readonly groupPerformanceService: GroupPerformanceService,
    private readonly studentDetailService: StudentDetailService,
    private readonly studentGroupService: StudentGroupService
  ) {}

  @Get("group/:groupId")
  @ApiOperation({ summary: "Get group performance statistics" })
  getGroupPerformance(@Param("groupId") groupId: string) {
    return this.groupPerformanceService.getGroupPerformance(groupId, [groupId]);
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get detailed student statistics" })
  getStudentDetails(@Param("studentId") studentId: string) {
    return this.studentDetailService.getDetailedStudentStats(studentId);
  }

  @Post("groups")
  @ApiOperation({ summary: "Create a new student group" })
  createGroup(@Body() createGroupDto: any) {
    return this.studentGroupService.createGroup(
      createGroupDto.teacherId,
      createGroupDto.name,
      createGroupDto.studentIds
    );
  }

  @Get("groups")
  @ApiOperation({ summary: "Get all teacher groups" })
  getTeacherGroups(@Param("teacherId") teacherId: string) {
    return this.studentGroupService.getTeacherGroups(teacherId);
  }
}
