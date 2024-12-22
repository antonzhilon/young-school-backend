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
import { TestAdminService } from "../services/test.admin.service";
import { AdminCreateTestDto } from "../dto/test/create-test.admin.dto";
import { AdminTestFilterDto } from "../dto/test/test-filter.admin.dto";

@ApiTags("admin-tests")
@Controller("admin/tests")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class TestAdminController {
  constructor(private readonly testAdminService: TestAdminService) {}

  @Post()
  @ApiOperation({ summary: "Create a new test with tasks" })
  create(@Body() createTestDto: AdminCreateTestDto) {
    return this.testAdminService.create(createTestDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all tests with filtering" })
  findAll(@Query() filters: AdminTestFilterDto) {
    return this.testAdminService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get test details by ID" })
  findOne(@Param("id") id: string) {
    return this.testAdminService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update test" })
  update(@Param("id") id: string, @Body() updateTestDto: AdminCreateTestDto) {
    return this.testAdminService.update(id, updateTestDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete test" })
  remove(@Param("id") id: string) {
    return this.testAdminService.remove(id);
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get test statistics" })
  getStats(@Param("id") id: string) {
    return this.testAdminService.getTestStats(id);
  }

  @Get(":id/results")
  @ApiOperation({ summary: "Get test results" })
  getResults(@Param("id") id: string) {
    return this.testAdminService.getTestResults(id);
  }
}
