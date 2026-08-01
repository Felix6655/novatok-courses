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

  console.log(`\n${failures === 0 ? "All route checks passed." : `${failures} check(s) FAILED.`}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error("Route smoke test crashed:", error);
  process.exitCode = 1;
});
