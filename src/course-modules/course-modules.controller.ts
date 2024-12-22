import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../common/enums/user-role.enum";
import { CourseModulesService } from "./course-modules.service";
import { CreateCourseModuleDto } from "./dto/create-course-module.dto";

@ApiTags("course-modules")
@Controller("course-modules")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CourseModulesController {
  constructor(private readonly moduleService: CourseModulesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Create a new course module" })
  create(@Body() createModuleDto: CreateCourseModuleDto) {
    return this.moduleService.create(createModuleDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all course modules" })
  findAll() {
    return this.moduleService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a course module by id" })
  findOne(@Param("id") id: string) {
    return this.moduleService.findOne(id);
  }

  @Get("course/:courseId")
  @ApiOperation({ summary: "Get all modules for a course" })
  findByCourse(@Param("courseId") courseId: string) {
    return this.moduleService.findByCourse(courseId);
  }
}
