import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { UserRole } from "../../common/enums/user-role.enum";

@Injectable()
export class RoleService {
  constructor(private readonly supabase: SupabaseService) {}

  async assignRole(userId: string, role: UserRole) {
    const { error: userError } = await this.supabase.client
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError) throw new NotFoundException("User not found");

    const { error } = await this.supabase.client.from("user_roles").insert({
      user_id: userId,
      role,
    });

    if (error) throw error;
  }

  async removeRole(userId: string, role: UserRole) {
    const { error } = await this.supabase.client
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) throw error;
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await this.supabase.client
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) throw error;
    return data.map((r) => r.role);
  }
}
