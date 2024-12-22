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
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-role.enum";
import { CourseManagementService } from "../services/course-management.service";
import { CreateCourseDto } from "../../courses/dto/create-course.dto";

@ApiTags("admin-courses")
@Controller("admin/courses")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class CourseManagementController {
  constructor(
    private readonly courseManagementService: CourseManagementService
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new course" })
  createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.courseManagementService.createCourse(createCourseDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a course" })
  updateCourse(
    @Param("id") id: string,
    @Body() updateCourseDto: CreateCourseDto
  ) {
    return this.courseManagementService.updateCourse(id, updateCourseDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a course" })
  deleteCourse(@Param("id") id: string) {
    return this.courseManagementService.deleteCourse(id);
  }

  @Get("analytics/:id")
  @ApiOperation({ summary: "Get course analytics" })
  getCourseAnalytics(@Param("id") id: string) {
    return this.courseManagementService.getCourseAnalytics(id);
  }
}
