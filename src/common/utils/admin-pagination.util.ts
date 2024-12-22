import { AdminPaginationDto } from "../../admin/dto/pagination.dto";
import { AdminPaginatedResponse } from "../../admin/interfaces/admin-response.interface";

export interface PaginationParams {
  from: number;
  to: number;
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection: "asc" | "desc";
}

export function getPaginationParams(
  filters: AdminPaginationDto
): PaginationParams {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return {
    from,
    to,
    page,
    limit,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection || "asc",
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  count: number | null,
  pagination: AdminPaginationDto
): AdminPaginatedResponse<T> {
  const limit = pagination.limit || 20;
  const page = pagination.page || 1;
  const totalPages = Math.ceil((count || 0) / limit);

  return {
    data: data || [],
    meta: {
      total: count || 0,
      page,
      lastPage: totalPages,
      hasNextPage: page < totalPages,
    },
  };
}
