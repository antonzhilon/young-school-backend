import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../../database/supabase.service";

@Injectable()
export class StudentGroupService {
  constructor(private readonly supabase: SupabaseService) {}

  async createGroup(teacherId: string, name: string, studentIds: string[]) {
    const { data, error } = await this.supabase.client
      .from("student_groups")
      .insert({
        teacher_id: teacherId,
        name,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    const groupId = data.id;
    await this.addStudentsToGroup(groupId, studentIds);

    return data;
  }

  async addStudentsToGroup(groupId: string, studentIds: string[]) {
    const groupMembers = studentIds.map((studentId) => ({
      group_id: groupId,
      student_id: studentId,
    }));

    const { error } = await this.supabase.client
      .from("student_group_members")
      .insert(groupMembers);

    if (error) throw error;
  }

  async removeStudentsFromGroup(groupId: string, studentIds: string[]) {
    const { error } = await this.supabase.client
      .from("student_group_members")
      .delete()
      .eq("group_id", groupId)
      .in("student_id", studentIds);

    if (error) throw error;
  }

  async getTeacherGroups(teacherId: string) {
    const { data, error } = await this.supabase.client
      .from("student_groups")
      .select(
        `
        *,
        members:student_group_members(
          student:users(
            id,
            email
          )
        )
      `
      )
      .eq("teacher_id", teacherId);

    if (error) throw error;
    return data;
  }
}
