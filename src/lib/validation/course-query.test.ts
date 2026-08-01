import { describe, expect, it } from "vitest";
import {
  MAX_PAGE_SIZE,
  courseListQuerySchema,
  normalizePageSearchParams,
  searchParamsToObject,
  slugParamSchema,
} from "@/lib/validation/course-query";

describe("courseListQuerySchema", () => {
  it("applies default page and limit when omitted", () => {
    const result = courseListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(12);
  });

  it("coerces numeric string params", () => {
    const result = courseListQuerySchema.parse({ page: "2", minPrice: "10", maxPrice: "100" });
    expect(result.page).toBe(2);
    expect(result.minPrice).toBe(10);
    expect(result.maxPrice).toBe(100);
  });

  it(`rejects a limit greater than ${MAX_PAGE_SIZE}`, () => {
    const result = courseListQuerySchema.safeParse({ limit: String(MAX_PAGE_SIZE + 1) });
    expect(result.success).toBe(false);
  });

  it("accepts a limit exactly at the maximum page size", () => {
    const result = courseListQuerySchema.safeParse({ limit: String(MAX_PAGE_SIZE) });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid level value", () => {
    const result = courseListQuerySchema.safeParse({ level: "EXPERT" });
    expect(result.success).toBe(false);
  });

  it("accepts valid level values", () => {
    for (const level of ["BEGINNER", "INTERMEDIATE", "ADVANCED"]) {
      expect(courseListQuerySchema.safeParse({ level }).success).toBe(true);
    }
  });

  it("transforms featured=true/false into a boolean", () => {
    expect(courseListQuerySchema.parse({ featured: "true" }).featured).toBe(true);
    expect(courseListQuerySchema.parse({ featured: "false" }).featured).toBe(false);
  });

  it("rejects a non-boolean-like featured value", () => {
    const result = courseListQuerySchema.safeParse({ featured: "yes" });
    expect(result.success).toBe(false);
  });

  it("rejects minPrice greater than maxPrice", () => {
    const result = courseListQuerySchema.safeParse({ minPrice: "200", maxPrice: "100" });
    expect(result.success).toBe(false);
  });

  it("accepts minPrice equal to maxPrice", () => {
    const result = courseListQuerySchema.safeParse({ minPrice: "100", maxPrice: "100" });
    expect(result.success).toBe(true);
  });

  it("rejects a non-positive page number", () => {
    expect(courseListQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(courseListQuerySchema.safeParse({ page: "-1" }).success).toBe(false);
  });

  it("rejects a non-numeric price", () => {
    const result = courseListQuerySchema.safeParse({ minPrice: "not-a-number" });
    expect(result.success).toBe(false);
  });
});

describe("slugParamSchema", () => {
  it("accepts a well-formed slug", () => {
    expect(slugParamSchema.safeParse("ai-for-business").success).toBe(true);
  });

  it("rejects slugs with uppercase letters", () => {
    expect(slugParamSchema.safeParse("AI-For-Business").success).toBe(false);
  });

  it("rejects slugs with spaces", () => {
    expect(slugParamSchema.safeParse("ai for business").success).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(slugParamSchema.safeParse("").success).toBe(false);
  });
});

describe("searchParamsToObject", () => {
  it("drops blank values so they don't coerce to 0", () => {
    const params = new URLSearchParams("minPrice=&search=ai&page=2");
    expect(searchParamsToObject(params)).toEqual({ search: "ai", page: "2" });
  });
});

describe("normalizePageSearchParams", () => {
  it("takes the first value from array entries", () => {
    expect(normalizePageSearchParams({ level: ["BEGINNER", "ADVANCED"] })).toEqual({
      level: "BEGINNER",
    });
  });

  it("drops undefined and blank entries", () => {
    expect(normalizePageSearchParams({ search: undefined, category: "" , page: "1"})).toEqual({
      page: "1",
    });
  });
});
