import type { Query } from 'mongoose';

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export function getPagination(query: PaginationOptions): { page: number; limit: number; skip: number } {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  return { page, limit, skip: (page - 1) * limit };
}

export async function paginate<T>(
  mongooseQuery: Query<T[], T>,
  options: PaginationOptions
): Promise<PaginationResult<T>> {
  const { page, limit, skip } = getPagination(options);
  const [items, total] = await Promise.all([
    mongooseQuery.skip(skip).limit(limit).exec(),
    (mongooseQuery.model as { countDocuments: (filter: Record<string, unknown>) => Promise<number> })
      .countDocuments(mongooseQuery.getFilter()),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}