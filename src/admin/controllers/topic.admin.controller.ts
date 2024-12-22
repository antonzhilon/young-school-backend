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
import { TopicAdminService } from "../services/topic.admin.service";
import { AdminCreateTopicDto } from "../dto/topic/create-topic.admin.dto";
import { AdminTopicFilterDto } from "../dto/topic/topic-filter.admin.dto";

@ApiTags("admin-topics")
@Controller("admin/topics")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class TopicAdminController {
  constructor(private readonly topicAdminService: TopicAdminService) {}

  @Post()
  @ApiOperation({ summary: "Create a new topic" })
  create(@Body() createTopicDto: AdminCreateTopicDto) {
    return this.topicAdminService.create(createTopicDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all topics with filtering" })
  findAll(@Query() filters: AdminTopicFilterDto) {
    return this.topicAdminService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get topic details by ID" })
  findOne(@Param("id") id: string) {
    return this.topicAdminService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update topic" })
  update(@Param("id") id: string, @Body() updateTopicDto: AdminCreateTopicDto) {
    return this.topicAdminService.update(id, updateTopicDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete topic" })
  remove(@Param("id") id: string) {
    return this.topicAdminService.remove(id);
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get topic statistics" })
  getStats(@Param("id") id: string) {
    return this.topicAdminService.getTopicStats(id);
  }

  @Get(":id/subtopics")
  @ApiOperation({ summary: "Get subtopics for a topic" })
  getSubtopics(@Param("id") id: string) {
    return this.topicAdminService.getSubtopics(id);
  }

  @Get(":id/lessons")
  @ApiOperation({ summary: "Get lessons for a topic" })
  getLessons(@Param("id") id: string) {
    return this.topicAdminService.getTopicLessons(id);
  }
}
