import {
  Controller,
  Get,
  Post,
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
import { CourseAdminService } from "../services/course.admin.service";
import { AdminCreateCourseDto } from "../dto/course/create-course.admin.dto";
import { AdminUpdateCourseDto } from "../dto/course/update-course.admin.dto";
import { AdminCourseFilterDto } from "../dto/course/course-filter.admin.dto";

@ApiTags("admin-courses")
@Controller("admin/courses")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class CourseAdminController {
  constructor(private readonly courseAdminService: CourseAdminService) {}

  @Post()
  @ApiOperation({ summary: "Create a new course" })
  create(@Body() createCourseDto: AdminCreateCourseDto) {
    return this.courseAdminService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all courses with filtering" })
  findAll(@Query() filters: AdminCourseFilterDto) {
    return this.courseAdminService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get course by ID" })
  findOne(@Param("id") id: string) {
    return this.courseAdminService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update course" })
  update(
    @Param("id") id: string,
    @Body() updateCourseDto: AdminUpdateCourseDto
  ) {
    return this.courseAdminService.update(id, updateCourseDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete course" })
  remove(@Param("id") id: string) {
    return this.courseAdminService.remove(id);
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get course statistics" })
  getStats(@Param("id") id: string) {
    return this.courseAdminService.getCourseStats(id);
  }
}
