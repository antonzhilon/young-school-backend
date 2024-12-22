import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { GrantAccessDto } from "../dto/grant-access.dto";
import { RevokeAccessDto } from "../dto/revoke-access.dto";
import {
  CourseAccess,
  CourseAccessWithDetails,
} from "../interfaces/course-access.interface";

@Injectable()
export class CourseAccessService {
  constructor(private readonly supabase: SupabaseService) {}

  async grantAccess(
    grantedBy: string,
    grantAccessDto: GrantAccessDto
  ): Promise<CourseAccess[]> {
    // Verify course exists
    const { error: courseError } = await this.supabase.client
      .from("courses")
      .select("id")
      .eq("id", grantAccessDto.courseId)
      .single();

    if (courseError) throw new NotFoundException("Course not found");

    // Create access records for each student
    const accessRecords = grantAccessDto.studentIds.map((studentId) => ({
      user_id: studentId,
      course_id: grantAccessDto.courseId,
      granted_by: grantedBy,
      valid_until: grantAccessDto.validUntil,
    }));

    const { data, error } = await this.supabase.client
      .from("course_access")
      .upsert(accessRecords)
      .select();

    if (error) throw error;
    return data;
  }

  async revokeAccess(revokeAccessDto: RevokeAccessDto): Promise<void> {
    const { error } = await this.supabase.client
      .from("course_access")
      .delete()
      .eq("course_id", revokeAccessDto.courseId)
      .in("user_id", revokeAccessDto.studentIds);

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
      await this.revokeAccess({
        studentIds: [userId],
        courseId,
      });
      return false;
    }

    return true;
  }

  async getUserCourseAccess(
    userId: string
  ): Promise<CourseAccessWithDetails[]> {
    const { data, error } = await this.supabase.client
      .from("course_access")
      .select(
        `
        *,
        course:courses (
          name,
          description
        ),
        user:users (
          email
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  }

  async getCourseStudents(
    courseId: string
  ): Promise<CourseAccessWithDetails[]> {
    const { data, error } = await this.supabase.client
      .from("course_access")
      .select(
        `
        *,
        user:users (
          email
        )
      `
      )
      .eq("course_id", courseId);

    if (error) throw error;
    return data;
  }
}
