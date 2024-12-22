import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SupabaseService } from "../../../database/supabase.service";
import {
  AdminAuthResponse,
  AdminLoginDto,
} from "../interfaces/admin-auth.interface";
import { UserRole } from "../../../common/enums/user-role.enum";

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly jwtService: JwtService
  ) {}

  async login(loginDto: AdminLoginDto): Promise<AdminAuthResponse> {
    const {
      data: { user },
      error,
    } = await this.supabase.client.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error) throw new UnauthorizedException("Invalid credentials");

    // Verify admin role
    const { data: roles } = await this.supabase.client
      .from("user_roles")
      .select("role")
      .eq("user_id", user?.id)
      .eq("role", UserRole.ADMIN)
      .single();

    if (!roles) {
      throw new UnauthorizedException("Insufficient privileges");
    }

    const payload = {
      sub: user?.id,
      email: user?.email,
      roles: [UserRole.ADMIN],
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user?.id || "",
        email: user?.email || "",
        roles: [UserRole.ADMIN],
      },
    };
  }

  async validateAdminToken(token: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token);
      const { data } = await this.supabase.client
        .from("user_roles")
        .select("role")
        .eq("user_id", payload.sub)
        .eq("role", UserRole.ADMIN)
        .single();

      return !!data;
    } catch {
      return false;
    }
  }
}
