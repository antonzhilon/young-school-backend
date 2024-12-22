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
import { LessonAdminService } from "../services/lesson.admin.service";
import { AdminCreateLessonDto } from "../dto/lesson/create-lesson.admin.dto";
import { AdminLessonFilterDto } from "../dto/lesson/lesson-filter.admin.dto";

@ApiTags("admin-lessons")
@Controller("admin/lessons")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class LessonAdminController {
  constructor(private readonly lessonAdminService: LessonAdminService) {}

  @Post()
  @ApiOperation({ summary: "Create a new lesson" })
  create(@Body() createLessonDto: AdminCreateLessonDto) {
    return this.lessonAdminService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all lessons with filtering" })
  findAll(@Query() filters: AdminLessonFilterDto) {
    return this.lessonAdminService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get lesson details by ID" })
  findOne(@Param("id") id: string) {
    return this.lessonAdminService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update lesson" })
  update(
    @Param("id") id: string,
    @Body() updateLessonDto: AdminCreateLessonDto
  ) {
    return this.lessonAdminService.update(id, updateLessonDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete lesson" })
  remove(@Param("id") id: string) {
    return this.lessonAdminService.remove(id);
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get lesson statistics" })
  getStats(@Param("id") id: string) {
    return this.lessonAdminService.getLessonStats(id);
  }

  @Get(":id/students")
  @ApiOperation({ summary: "Get student progress for lesson" })
  getStudentProgress(@Param("id") id: string) {
    return this.lessonAdminService.getStudentProgress(id);
  }
}
