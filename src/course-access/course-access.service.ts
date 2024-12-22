import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../database/supabase.service";
import { GrantAccessDto } from "./dto/grant-access.dto";

@Injectable()
export class CourseAccessService {
  constructor(private readonly supabase: SupabaseService) {}

  async grantAccess(grantedBy: string, grantAccessDto: GrantAccessDto) {
    // Verify course exists
    const { error: courseError } = await this.supabase.client
      .from("courses")
      .select("id")
      .eq("id", grantAccessDto.courseId)
      .single();

    if (courseError) throw new NotFoundException("Course not found");

    // Verify user exists
    const { error: userError } = await this.supabase.client
      .from("user_roles")
      .select("role")
      .eq("user_id", grantAccessDto.userId)
      .single();

    if (userError) throw new NotFoundException("User not found");

    const { error } = await this.supabase.client.from("course_access").insert({
      user_id: grantAccessDto.userId,
      course_id: grantAccessDto.courseId,
      granted_by: grantedBy,
      valid_until: grantAccessDto.validUntil,
    });

    if (error) throw error;
  }

  async revokeAccess(userId: string, courseId: string) {
    const { error } = await this.supabase.client
      .from("course_access")
      .delete()
      .eq("user_id", userId)
      .eq("course_id", courseId);

    if (error) throw error;
  }

  async verifyAccess(userId: string, courseId: string): Promise<boolean> {
    const { data, error } = await this.supabase.client
      .from("course_access")
      .select("valid_until")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (error) return false;

    if (!data) return false;

    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      await this.revokeAccess(userId, courseId);
      return false;
    }

    return true;
  }

  async getUserCourseAccess(userId: string) {
    const { data, error } = await this.supabase.client
      .from("course_access")
      .select(
        `
        course_id,
        valid_until,
        courses (
          name,
          description,
          is_paid
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  }
}
