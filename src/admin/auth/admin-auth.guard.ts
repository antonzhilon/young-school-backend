import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { Observable, from, lastValueFrom } from "rxjs";
import { UserRole } from "../../common/enums/user-role.enum";

@Injectable()
export class AdminAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isValid = await lastValueFrom(from(super.canActivate(context)));

    if (!isValid) {
      throw new UnauthorizedException("Invalid admin credentials");
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.roles?.includes(UserRole.ADMIN)) {
      throw new UnauthorizedException("Insufficient admin privileges");
    }

    return true;
  }
}
