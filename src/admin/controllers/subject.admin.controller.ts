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
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { Roles } from "@/auth/decorators/roles.decorator";
import { UserRole } from "@/common/enums/user-role.enum";
import { SubjectAdminService } from "../services/subject.admin.service";
import { AdminCreateSubjectDto } from "../dto/subject/create-subject.admin.dto";
import { AdminSubjectFilterDto } from "../dto/subject/subject-filter.admin.dto";

@ApiTags("admin-subjects")
@Controller("admin/subjects")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class SubjectAdminController {
  constructor(private readonly subjectAdminService: SubjectAdminService) {}

  @Post()
  @ApiOperation({ summary: "Create a new subject" })
  create(@Body() createSubjectDto: AdminCreateSubjectDto) {
    return this.subjectAdminService.create(createSubjectDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all subjects with filtering" })
  findAll(@Query() filters: AdminSubjectFilterDto) {
    return this.subjectAdminService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get subject details by ID" })
  findOne(@Param("id") id: string) {
    return this.subjectAdminService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update subject" })
  update(
    @Param("id") id: string,
    @Body() updateSubjectDto: AdminCreateSubjectDto
  ) {
    return this.subjectAdminService.update(id, updateSubjectDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete subject" })
  remove(@Param("id") id: string) {
    return this.subjectAdminService.remove(id);
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get subject statistics" })
  getStats(@Param("id") id: string) {
    return this.subjectAdminService.getSubjectStats(id);
  }

  @Get(":id/courses")
  @ApiOperation({ summary: "Get courses for subject" })
  getCourses(@Param("id") id: string) {
    return this.subjectAdminService.getSubjectCourses(id);
  }
}
