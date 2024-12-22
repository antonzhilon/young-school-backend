import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';

export function getPaginationRange(pagination: PaginationDto) {
  const limit = pagination.limit || 10;
  const page = pagination.page || 1;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return { from, to };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationDto,
): PaginatedResponse<T> {
  const limit = pagination.limit || 10;
  const page = pagination.page || 1;
  const lastPage = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      lastPage,
      hasNextPage: page < lastPage,
    },
  };
}
