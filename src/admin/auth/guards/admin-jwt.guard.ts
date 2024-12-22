import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";

@Injectable()
export class AdminJwtGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isValid = await super.canActivate(context);
      if (!isValid) {
        throw new UnauthorizedException("Invalid admin credentials");
      }
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid admin session");
    }
  }
}
