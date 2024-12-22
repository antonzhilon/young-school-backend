import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { AdminCreateTopicDto } from "../dto/topic/create-topic.admin.dto";
import { AdminTopicFilterDto } from "../dto/topic/topic-filter.admin.dto";
import { AdminPaginatedResponse } from "../interfaces/admin-response.interface";
import {
  AdminTopicDetails,
  AdminTopicStats,
} from "../interfaces/topic.admin.interface";

@Injectable()
export class TopicAdminService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(
    createTopicDto: AdminCreateTopicDto
  ): Promise<AdminTopicDetails> {
    const { data, error } = await this.supabase.client
      .from("topics")
      .insert({
        name: createTopicDto.name,
        description: createTopicDto.description,
        subject_id: createTopicDto.subjectId,
        parent_id: createTopicDto.parentId,
      })
      .select()
      .single();

    if (error) throw error;

    if (createTopicDto.relatedTopics?.length) {
      await this.updateRelatedTopics(data.id, createTopicDto.relatedTopics);
    }

    return this.enrichTopicDetails(data);
  }

  async findAll(
    filters: AdminTopicFilterDto
  ): Promise<AdminPaginatedResponse<AdminTopicDetails>> {
    let query = this.supabase.client
      .from("topics")
      .select("*", { count: "exact" });

    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
    }
    if (filters.subjectId) {
      query = query.eq("subject_id", filters.subjectId);
    }
    if (filters.parentId) {
      query = query.eq("parent_id", filters.parentId);
    }

    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;

    if (filters.sortBy) {
      query = query.order(filters.sortBy, {
        ascending: filters.sortDirection === "asc",
      });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const topicDetails = await Promise.all(
      data.map((topic) => this.enrichTopicDetails(topic))
    );

    const totalPages = Math.ceil((count || 0) / filters.limit);

    return {
      data: topicDetails,
      meta: {
        total: count || 0,
        page: filters.page,
        lastPage: totalPages,
        hasNextPage: filters.page < totalPages,
      },
    };
  }

  async findOne(id: string): Promise<AdminTopicDetails> {
    const { data, error } = await this.supabase.client
      .from("topics")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Topic not found");

    return this.enrichTopicDetails(data);
  }

  async update(
    id: string,
    updateTopicDto: AdminCreateTopicDto
  ): Promise<AdminTopicDetails> {
    const { data, error } = await this.supabase.client
      .from("topics")
      .update({
        name: updateTopicDto.name,
        description: updateTopicDto.description,
        subject_id: updateTopicDto.subjectId,
        parent_id: updateTopicDto.parentId,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Topic not found");

    if (updateTopicDto.relatedTopics) {
      await this.updateRelatedTopics(id, updateTopicDto.relatedTopics);
    }

    return this.enrichTopicDetails(data);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from("topics")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getTopicStats(id: string): Promise<AdminTopicStats> {
    const [
      enrollments,
      activeStudents,
      completionRate,
      timeSpent,
      popularLessons,
      progress,
    ] = await Promise.all([
      this.getTotalEnrollments(id),
      this.getActiveStudents(id),
      this.getCompletionRate(id),
      this.getAverageTimeSpent(id),
      this.getPopularLessons(id),
      this.getStudentProgress(id),
    ]);

    return {
      totalEnrollments: enrollments,
      activeStudents,
      completionRate,
      averageTimeSpent: timeSpent,
      popularLessons,
      studentProgress: progress,
    };
  }

  async getSubtopics(id: string): Promise<AdminTopicDetails[]> {
    const { data, error } = await this.supabase.client
      .from("topics")
      .select("*")
      .eq("parent_id", id);

    if (error) throw error;
    return Promise.all(data.map((topic) => this.enrichTopicDetails(topic)));
  }

  async getTopicLessons(id: string) {
    const { data, error } = await this.supabase.client
      .from("lessons")
      .select(
        `
        *,
        views:learning_activities(count)
      `
      )
      .eq("topic_id", id);

    if (error) throw error;
    return data;
  }

  private async enrichTopicDetails(topic: any): Promise<AdminTopicDetails> {
    const [
      subtopics,
      relatedTopics,
      totalLessons,
      totalStudents,
      averageProgress,
    ] = await Promise.all([
      this.getSubtopicsCount(topic.id),
      this.getRelatedTopics(topic.id),
      this.getLessonsCount(topic.id),
      this.getStudentsCount(topic.id),
      this.getAverageProgress(topic.id),
    ]);

    return {
      ...topic,
      subtopics,
      relatedTopics,
      totalLessons,
      totalStudents,
      averageProgress,
    };
  }

  private async updateRelatedTopics(
    topicId: string,
    relatedTopicIds: string[]
  ): Promise<void> {
    // Implementation for updating related topics
    // This would involve managing a many-to-many relationship table
  }

  private async getSubtopicsCount(topicId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("topics")
      .select("*", { count: "exact" })
      .eq("parent_id", topicId);

    return count || 0;
  }

  private async getRelatedTopics(topicId: string): Promise<string[]> {
    // Implementation for getting related topics
    return [];
  }

  private async getLessonsCount(topicId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("lessons")
      .select("*", { count: "exact" })
      .eq("topic_id", topicId);

    return count || 0;
  }

  private async getStudentsCount(topicId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("learning_activities")
      .select("student_id", { count: "exact", distinct: true })
      .eq("topic_id", topicId);

    return count || 0;
  }

  private async getAverageProgress(topicId: string): Promise<number> {
    const { data } = await this.supabase.client
      .from("user_progress")
      .select("progress_percentage")
      .eq("topic_id", topicId);

    if (!data?.length) return 0;
    return (
      data.reduce((sum, record) => sum + (record.progress_percentage || 0), 0) /
      data.length
    );
  }

  private async getTotalEnrollments(topicId: string): Promise<number> {
    // Implementation for getting total enrollments
    return 0;
  }

  private async getActiveStudents(topicId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("learning_activities")
      .select("student_id", { count: "exact", distinct: true })
      .eq("topic_id", topicId)
      .gte(
        "timestamp",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      );

    return count || 0;
  }

  private async getCompletionRate(topicId: string): Promise<number> {
    const { data } = await this.supabase.client
      .from("user_progress")
      .select("progress_percentage")
      .eq("topic_id", topicId);

    if (!data?.length) return 0;

    const completedCount = data.filter(
      (record) => record.progress_percentage === 100
    ).length;
    return (completedCount / data.length) * 100;
  }

  private async getAverageTimeSpent(topicId: string): Promise<number> {
    const { data } = await this.supabase.client
      .from("learning_activities")
      .select("duration")
      .eq("topic_id", topicId);

    if (!data?.length) return 0;
    return (
      data.reduce((sum, record) => sum + (record.duration || 0), 0) /
      data.length
    );
  }

  private async getPopularLessons(topicId: string) {
    const { data } = await this.supabase.client
      .from("lessons")
      .select(
        `
        id,
        name,
        views:learning_activities(count)
      `
      )
      .eq("topic_id", topicId)
      .order("views", { ascending: false })
      .limit(5);

    return (
      data?.map((lesson) => ({
        id: lesson.id,
        name: lesson.name,
        views: lesson.views,
      })) || []
    );
  }

  private async getStudentProgress(topicId: string) {
    const { data } = await this.supabase.client
      .from("user_progress")
      .select("progress_percentage")
      .eq("topic_id", topicId);

    if (!data?.length) {
      return {
        completed: 0,
        inProgress: 0,
        notStarted: 0,
      };
    }

    return {
      completed: data.filter((p) => p.progress_percentage === 100).length,
      inProgress: data.filter(
        (p) => p.progress_percentage > 0 && p.progress_percentage < 100
      ).length,
      notStarted: data.filter((p) => p.progress_percentage === 0).length,
    };
  }
}
