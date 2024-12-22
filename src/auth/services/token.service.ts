import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "../interfaces/auth.interface";
import { UserRole } from "../../common/enums/user-role.enum";
import { SupabaseService } from "../../database/supabase.service";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly supabase: SupabaseService
  ) {}

  async generateToken(userId: string, email: string): Promise<string> {
    const { data: roles } = await this.supabase.client
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const payload: JwtPayload = {
      sub: userId,
      email,
      roles: roles?.map((r) => r.role) || [UserRole.STUDENT],
    };

    return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verify(token);
  }
}
