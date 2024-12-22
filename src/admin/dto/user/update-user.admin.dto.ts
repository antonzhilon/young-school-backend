import { IsOptional, IsEnum, IsBoolean } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "../../../common/enums/user-role.enum";

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ description: "User role", enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: "User active status" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
