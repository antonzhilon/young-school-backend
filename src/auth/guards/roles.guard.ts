import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../../common/enums/user-role.enum";
import { SupabaseService } from "../../database/supabase.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private supabase: SupabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      "roles",
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      return false;
    }

    const { data: userRoles } = await this.supabase.client
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const userRoleValues = userRoles?.map((ur) => ur.role) || [];
    return requiredRoles.some((role) => userRoleValues.includes(role));
  }
}
