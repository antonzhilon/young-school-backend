import { SetMetadata, applyDecorators, UseGuards } from "@nestjs/common";
import { AdminJwtGuard } from "../guards/admin-jwt.guard";
import { AdminRoleGuard } from "../guards/admin-role.guard";

export const ADMIN_REQUIRED = "adminRequired";

export const Admin = () =>
  applyDecorators(
    SetMetadata(ADMIN_REQUIRED, true),
    UseGuards(AdminJwtGuard, AdminRoleGuard)
  );
