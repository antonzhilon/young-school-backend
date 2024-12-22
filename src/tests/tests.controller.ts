import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../common/enums/user-role.enum";
import { TestsService } from "./tests.service";
import { CreateTestDto } from "./dto/create-test.dto";

@ApiTags("tests")
@Controller("tests")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Create a new test" })
  create(@Body() createTestDto: CreateTestDto) {
    return this.testsService.create(createTestDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all tests" })
  findAll() {
    return this.testsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a test by id" })
  findOne(@Param("id") id: string) {
    return this.testsService.findOne(id);
  }
}
