import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@/common/enums/user-role.enum";
import { ADMIN_REQUIRED } from "../decorators/admin.decorator";

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAdminRequired = this.reflector.getAllAndOverride<boolean>(
      ADMIN_REQUIRED,
      [context.getHandler(), context.getClass()]
    );

    if (!isAdminRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.roles?.includes(UserRole.ADMIN)) {
      throw new UnauthorizedException("Insufficient admin privileges");
    }

    return true;
  }
}
