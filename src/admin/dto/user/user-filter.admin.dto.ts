import { IsOptional, IsString, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AdminPaginationDto } from "../pagination.dto";
import { UserRole } from "../../../common/enums/user-role.enum";

export class AdminUserFilterDto extends AdminPaginationDto {
  @ApiPropertyOptional({ description: "Filter by email" })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: "Filter by role", enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: "Filter by active status" })
  @IsOptional()
  isActive?: boolean;
}
