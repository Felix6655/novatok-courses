/**
 * Live HTTP-level route smoke test — run against an already-built and
 * started server (`npm run build && npm run start`, or `npm run dev`).
 * Not part of the automated Vitest suite: page routing status codes are
 * only observable through an actual running Next.js server, not by
 * calling page components directly.
 *
 * Primarily exists as regression coverage for the Sprint 4 bug where
 * notFound() on /courses/[slug] and /courses/[slug]/tutor rendered
 * correct content but returned HTTP 200 instead of 404 (fixed in
 * Sprint 5 by removing the segment-level loading.tsx that forced
 * streaming before notFound() could set the status).
 */

const BASE_URL = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

let failures = 0;

async function checkStatus(path: string, expectedStatus: number) {
  const response = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
  const ok = response.status === expectedStatus;
  if (ok) {
    console.log(`  ok   GET ${path} -> ${response.status}`);
  } else {
    failures++;
    console.log(`  FAIL GET ${path} -> ${response.status} (expected ${expectedStatus})`);
  }
}

/** Extracts just the `name=value` part of a Set-Cookie header for reuse on the next request. */
function cookiePair(setCookieHeader: string): string {
  return setCookieHeader.split(";")[0];
}

async function postJson(path: string, cookie: string, body: unknown) {
  return fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify(body),
  });
}

function checkResponseStatus(label: string, response: Response, expectedStatus: number) {
  const ok = response.status === expectedStatus;
  if (ok) {
    console.log(`  ok   ${label} -> ${response.status}`);
  } else {
    failures++;
    console.log(`  FAIL ${label} -> ${response.status} (expected ${expectedStatus})`);
  }
  return ok;
}

async function main() {
  console.log(`Checking routes against ${BASE_URL}\n`);

  console.log("Catalog");
  await checkStatus("/courses", 200);
  await checkStatus("/courses/javascript-fundamentals", 200);
  await checkStatus("/courses/not-a-real-course-slug", 404);
  await checkStatus("/categories/not-a-real-category-slug", 404);

  console.log("\nTutor");
  await checkStatus("/courses/javascript-fundamentals/tutor", 200);
  await checkStatus("/courses/not-a-real-course-slug/tutor", 404);

  console.log("\nAdvisor");
  await checkStatus("/courses/advisor", 200);

  console.log("\nLearning");
  await checkStatus("/learn", 200);
  await checkStatus("/learn/javascript-fundamentals", 200);
  await checkStatus("/learn/not-a-real-course-slug", 404);

  console.log("\nLearning API (enroll -> progress -> practice -> evaluate)");
  const identityResponse = await fetch(`${BASE_URL}/learn`, { redirect: "manual" });
  const setCookie = identityResponse.headers.get("set-cookie");
  if (!setCookie) {
    failures++;
    console.log("  FAIL middleware did not set the dev student identity cookie on a fresh request");
  } else {
    const cookie = cookiePair(setCookie);
    console.log(`  ok   dev identity cookie assigned by middleware`);

    const enrollResponse = await postJson("/api/learning/enroll", cookie, {
      courseSlug: "javascript-fundamentals",
    });
    checkResponseStatus("POST /api/learning/enroll (valid)", enrollResponse, 200);

    const badEnrollResponse = await postJson("/api/learning/enroll", cookie, {});
    checkResponseStatus("POST /api/learning/enroll (missing courseSlug)", badEnrollResponse, 400);

    const unknownCourseResponse = await postJson("/api/learning/enroll", cookie, {
      courseSlug: "not-a-real-course-slug",
    });
    checkResponseStatus("POST /api/learning/enroll (unknown course)", unknownCourseResponse, 404);

    const progressResponse = await postJson("/api/learning/progress", cookie, {
      courseSlug: "javascript-fundamentals",
      lessonSlug: "variables-and-data-types",
    });
    checkResponseStatus("POST /api/learning/progress (valid)", progressResponse, 200);

    const crossCourseProgressResponse = await postJson("/api/learning/progress", cookie, {
      courseSlug: "javascript-fundamentals",
      lessonSlug: "the-cia-triad",
    });
    checkResponseStatus(
      "POST /api/learning/progress (lesson from another course)",
      crossCourseProgressResponse,
      404,
    );

    console.log("  (practice endpoints call the AI provider — real Ollama call, may take a few seconds)");
    const practiceResponse = await postJson("/api/learning/practice", cookie, {
      courseSlug: "javascript-fundamentals",
      lessonSlug: "functions-and-control-flow",
    });
    const practiceOk = checkResponseStatus("POST /api/learning/practice (valid)", practiceResponse, 200);

    if (practiceOk) {
      const practiceBody = await practiceResponse.json();
      const evaluateResponse = await postJson("/api/learning/practice/evaluate", cookie, {
        practiceId: practiceBody.practiceId,
        studentAnswer: practiceBody.questionType === "MULTIPLE_CHOICE" ? "0" : "a reasonable attempt",
      });
      checkResponseStatus("POST /api/learning/practice/evaluate (valid)", evaluateResponse, 200);

      const replayResponse = await postJson("/api/learning/practice/evaluate", cookie, {
        practiceId: practiceBody.practiceId,
        studentAnswer: "0",
      });
      checkResponseStatus(
        "POST /api/learning/practice/evaluate (replay of consumed practiceId)",
        replayResponse,
        404,
      );
    }

    // Clean up this smoke run's dev-identity data so it doesn't linger in the DB.
    await import("dotenv/config");
    const { prisma } = await import("@/lib/prisma");
    const studentId = cookie.split("=")[1];
    await prisma.learningActivity.deleteMany({ where: { studentId } });
    await prisma.lessonProgress.deleteMany({ where: { studentId } });
    await prisma.studentEnrollment.deleteMany({ where: { studentId } });
    await prisma.$disconnect();
  }

  console.log(`\n${failures === 0 ? "All route checks passed." : `${failures} check(s) FAILED.`}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error("Route smoke test crashed:", error);
  process.exitCode = 1;
});
