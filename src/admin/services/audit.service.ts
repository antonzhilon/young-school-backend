import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { AuditLog, AuditAction } from "../interfaces/audit-log.interface";

@Injectable()
export class AuditService {
  constructor(private readonly supabase: SupabaseService) {}

  async logAction(log: Omit<AuditLog, "id" | "timestamp">) {
    const { error } = await this.supabase.client.from("audit_logs").insert({
      ...log,
      changes: JSON.stringify(log.changes || {}),
      timestamp: new Date().toISOString(),
    });

    if (error) throw error;
  }

  async getAuditLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    let query = this.supabase.client
      .from("audit_logs")
      .select("*")
      .order("timestamp", { ascending: false });

    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters?.action) {
      query = query.eq("action", filters.action);
    }
    if (filters?.entityType) {
      query = query.eq("entity_type", filters.entityType);
    }
    if (filters?.startDate) {
      query = query.gte("timestamp", filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte("timestamp", filters.endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map((log) => ({
      ...log,
      changes: JSON.parse(log.changes || "{}"),
      timestamp: new Date(log.timestamp),
    }));
  }
}
