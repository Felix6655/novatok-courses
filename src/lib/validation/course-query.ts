import { z } from "zod";

export const COURSE_LEVEL_VALUES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

export const courseListQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(200).optional(),
    category: z.string().trim().min(1).max(200).optional(),
    level: z.enum(COURSE_LEVEL_VALUES).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    featured: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "minPrice must be less than or equal to maxPrice",
      path: ["minPrice"],
    },
  );

export type CourseListQuery = z.infer<typeof courseListQuerySchema>;

export const slugParamSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

/**
 * Converts URLSearchParams into a plain object, dropping blank values so
 * `?minPrice=` behaves like the param was never sent instead of coercing
 * to 0.
 */
export function searchParamsToObject(
  searchParams: URLSearchParams,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    if (value.trim() !== "") {
      result[key] = value;
    }
  }
  return result;
}

export type PageSearchParams = Record<string, string | string[] | undefined>;

/**
 * Normalizes the Next.js App Router page `searchParams` shape (string,
 * string[], or undefined per key) into the plain string map the rest of
 * the validation and filter-building code expects.
 */
export function normalizePageSearchParams(
  searchParams: PageSearchParams,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    const flat = Array.isArray(value) ? value[0] : value;
    if (flat && flat.trim() !== "") {
      result[key] = flat;
    }
  }
  return result;
}
