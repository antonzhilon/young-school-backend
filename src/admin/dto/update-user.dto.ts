import { IsEnum, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../common/enums/user-role.enum";

export class UpdateUserDto {
  @ApiProperty({ enum: UserRole, description: "User role" })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
