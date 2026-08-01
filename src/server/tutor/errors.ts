/** No PUBLISHED course matches the requested slug. Maps to 404 at the API layer. */
export class TutorCourseNotFoundError extends Error {
  constructor(courseSlug: string) {
    super(`No published course found with slug "${courseSlug}"`);
    this.name = "TutorCourseNotFoundError";
  }
}

/** The course exists but has no Sprint 3 module/lesson content yet. Maps to 422. */
export class TutorNoContentError extends Error {
  constructor(courseSlug: string) {
    super(`Course "${courseSlug}" has no Tutor-ready lesson content yet`);
    this.name = "TutorNoContentError";
  }
}

/** The requested lessonSlug doesn't exist, or doesn't belong to the requested course. Maps to 404. */
export class TutorLessonNotFoundError extends Error {
  constructor(courseSlug: string, lessonSlug: string) {
    super(`No lesson "${lessonSlug}" found in course "${courseSlug}"`);
    this.name = "TutorLessonNotFoundError";
  }
}
