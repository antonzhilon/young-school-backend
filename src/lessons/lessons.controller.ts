import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../common/enums/user-role.enum";
import { LessonsService } from "./lessons.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";

@ApiTags("lessons")
@Controller("lessons")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Create a new lesson" })
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all lessons" })
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a lesson by id" })
  findOne(@Param("id") id: string) {
    return this.lessonsService.findOne(id);
  }

  @Get("module/:moduleId")
  @ApiOperation({ summary: "Get all lessons for a module" })
  findByModule(@Param("moduleId") moduleId: string) {
    return this.lessonsService.findByModule(moduleId);
  }

  @Get("subject/:subjectId")
  @ApiOperation({ summary: "Get all lessons for a subject" })
  findBySubject(@Param("subjectId") subjectId: string) {
    return this.lessonsService.findBySubject(subjectId);
  }
}
