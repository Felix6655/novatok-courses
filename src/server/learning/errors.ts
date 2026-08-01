/** No PUBLISHED course matches the requested slug — mirrors TutorCourseNotFoundError. Maps to 404. */
export class EnrollmentCourseNotFoundError extends Error {
  constructor(courseSlug: string) {
    super(`No published course found with slug "${courseSlug}"`);
    this.name = "EnrollmentCourseNotFoundError";
  }
}

/** The student has no enrollment in this course. Maps to 403/404 depending on context. */
export class NotEnrolledError extends Error {
  constructor(courseSlug: string) {
    super(`Not enrolled in course "${courseSlug}"`);
    this.name = "NotEnrolledError";
  }
}

/** The requested lesson doesn't exist, or doesn't belong to the requested course. Maps to 404. */
export class LearningLessonNotFoundError extends Error {
  constructor(courseSlug: string, lessonSlug: string) {
    super(`No lesson "${lessonSlug}" found in course "${courseSlug}"`);
    this.name = "LearningLessonNotFoundError";
  }
}

/**
 * The practiceId is unknown, already consumed, expired, or belongs to a
 * different student — deliberately one message for all four so a client
 * can't distinguish "not yours" from "doesn't exist". Maps to 404.
 */
export class PracticeNotFoundError extends Error {
  constructor() {
    super("This practice question is no longer available. Request a new one.");
    this.name = "PracticeNotFoundError";
  }
}
