import { NextRequest, NextResponse } from "next/server";
import { badRequest } from "@/lib/api-response";
import { courseListQuerySchema, searchParamsToObject } from "@/lib/validation/course-query";
import { listCourses } from "@/server/courses";

export async function GET(request: NextRequest) {
  const parsed = courseListQuerySchema.safeParse(
    searchParamsToObject(request.nextUrl.searchParams),
  );

  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  const result = await listCourses(parsed.data);
  return NextResponse.json(result);
}
