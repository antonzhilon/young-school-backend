import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { UpdateUserDto } from "../dto/update-user.dto";
import { AuditService } from "./audit.service";

@Injectable()
export class UserManagementService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly auditService: AuditService
  ) {}

  async getAllUsers() {
    const { data, error } = await this.supabase.client.from("user_roles")
      .select(`
        user_id,
        role,
        users!inner (
          email,
          created_at,
          last_sign_in_at
        )
      `);

    if (error) throw error;
    return data;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const { data: oldData } = await this.supabase.client
      .from("user_roles")
      .select("*")
      .eq("user_id", id)
      .single();

    const { data, error } = await this.supabase.client
      .from("user_roles")
      .update({ role: updateUserDto.role })
      .eq("user_id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("User not found");

    await this.auditService.logAction({
      userId: id,
      action: "UPDATE",
      entityType: "USER",
      entityId: id,
      changes: {
        old: oldData,
        new: data,
      },
    });

    return data;
  }

  async deactivateUser(id: string) {
    const { error } = await this.supabase.client.auth.admin.deleteUser(id);
    if (error) throw error;

    await this.auditService.logAction({
      userId: id,
      action: "DELETE",
      entityType: "USER",
      entityId: id,
    });
  }
}
