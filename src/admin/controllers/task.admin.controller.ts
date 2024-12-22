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
import { TaskAdminService } from "../services/task.admin.service";
import { AdminCreateTaskDto } from "../dto/task/create-task.admin.dto";
import { AdminTaskFilterDto } from "../dto/task/task-filter.admin.dto";

@ApiTags("admin-tasks")
@Controller("admin/tasks")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class TaskAdminController {
  constructor(private readonly taskAdminService: TaskAdminService) {}

  @Post()
  @ApiOperation({ summary: "Create a new task" })
  create(@Body() createTaskDto: AdminCreateTaskDto) {
    return this.taskAdminService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all tasks with filtering" })
  findAll(@Query() filters: AdminTaskFilterDto) {
    return this.taskAdminService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get task details by ID" })
  findOne(@Param("id") id: string) {
    return this.taskAdminService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update task" })
  update(@Param("id") id: string, @Body() updateTaskDto: AdminCreateTaskDto) {
    return this.taskAdminService.update(id, updateTaskDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete task" })
  remove(@Param("id") id: string) {
    return this.taskAdminService.remove(id);
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get task statistics" })
  getStats(@Param("id") id: string) {
    return this.taskAdminService.getTaskStats(id);
  }

  @Get(":id/answers")
  @ApiOperation({ summary: "Get student answers for task" })
  getAnswers(@Param("id") id: string) {
    return this.taskAdminService.getTaskAnswers(id);
  }
}
