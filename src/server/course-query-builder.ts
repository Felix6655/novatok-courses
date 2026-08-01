import type { Prisma } from "@/generated/prisma/client";
import type { CourseListQuery } from "@/lib/validation/course-query";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Pure translation from validated query filters to a Prisma where clause.
 * Kept separate from any Prisma Client calls so filter combinations are
 * unit-testable without a database.
 */
export function buildCourseWhere(
  filters: Pick<
    CourseListQuery,
    "search" | "category" | "level" | "minPrice" | "maxPrice" | "featured"
  >,
): Prisma.CourseWhereInput {
  const where: Prisma.CourseWhereInput = {
    status: "PUBLISHED",
  };

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.level) {
    where.level = filters.level;
  }

  if (filters.featured !== undefined) {
    where.featured = filters.featured;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { shortDescription: { contains: filters.search, mode: "insensitive" } },
      { fullDescription: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

export function computePagination(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
