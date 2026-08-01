import { NextResponse } from "next/server";
import { badRequest, notFound } from "@/lib/api-response";
import { slugParamSchema } from "@/lib/validation/course-query";
import { getCourseBySlug, getRelatedCourses } from "@/server/courses";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const parsedSlug = slugParamSchema.safeParse(slug);

  if (!parsedSlug.success) {
    return badRequest(parsedSlug.error);
  }

  const course = await getCourseBySlug(parsedSlug.data);

  if (!course) {
    return notFound("Course not found");
  }

  const relatedCourses = await getRelatedCourses(course);

  return NextResponse.json({
    course,
    category: course.category,
    relatedCourses,
  });
}
