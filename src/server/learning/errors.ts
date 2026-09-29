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


/** The course is real but does not offer a completion certificate. Maps to 409. */
export class CertificateUnavailableError extends Error {
  constructor(courseSlug: string) {
    super(`Course "${courseSlug}" does not offer a completion certificate.`);
    this.name = "CertificateUnavailableError";
  }
}

/** The student is enrolled, but the server-calculated course progress is not yet 100%. Maps to 409. */
export class CourseNotCompleteError extends Error {
  constructor(courseSlug: string) {
    super(`Course "${courseSlug}" must be completed before a certificate can be issued.`);
    this.name = "CourseNotCompleteError";
  }
}


/** A certificate course requires a passing final assessment before issuance. Maps to 409. */
export class FinalExamRequiredError extends Error {
  constructor(courseSlug: string) {
    super(`Pass the final assessment for "${courseSlug}" before issuing a certificate.`);
    this.name = "FinalExamRequiredError";
  }
}

/** The final exam attempt is missing, expired, submitted, or belongs to another student. Maps to 404. */
export class FinalExamAttemptNotFoundError extends Error {
  constructor() {
    super("This final assessment is no longer available. Start a new attempt.");
    this.name = "FinalExamAttemptNotFoundError";
  }
}


/** A paid course cannot be enrolled through the free learning mutation. */
export class CoursePurchaseRequiredError extends Error {
  constructor(courseSlug: string) {
    super(`Course "${courseSlug}" requires purchase before enrollment.`);
    this.name = "CoursePurchaseRequiredError";
  }
}

/** A published catalog entry exists, but it has no real lesson content yet. */
export class CourseContentUnavailableError extends Error {
  constructor(courseSlug: string) {
    super(`Course "${courseSlug}" is not ready for enrollment yet.`);
    this.name = "CourseContentUnavailableError";
  }
}
