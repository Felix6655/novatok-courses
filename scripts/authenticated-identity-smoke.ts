import "dotenv/config";
import { prisma } from "@/lib/prisma";

const social = process.env.NOVATOK_SOCIAL_ORIGIN;
const courses = process.env.AUTH_SMOKE_COURSES_ORIGIN ?? "http://localhost:3000";
const users = [
  { email: process.env.NOVATOK_AUTH_TEST_EMAIL, password: process.env.NOVATOK_AUTH_TEST_PASSWORD },
  { email: process.env.NOVATOK_AUTH_TEST_EMAIL_2, password: process.env.NOVATOK_AUTH_TEST_PASSWORD_2 },
];
if (!social || users.some((user) => !user.email || !user.password)) {
  throw new Error("smoke:auth requires NOVATOK_SOCIAL_ORIGIN and two NOVATOK_AUTH_TEST_EMAIL/PASSWORD credential pairs");
}

const socialOrigin = social;

function cookieHeader(response: Response) {
  const values = response.headers.getSetCookie();
  return values.map((value) => value.split(";", 1)[0]).join("; ");
}
async function login(user: (typeof users)[number]) {
  const response = await fetch(`${socialOrigin}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json", origin: socialOrigin }, body: JSON.stringify(user) });
  if (!response.ok) throw new Error(`Social login failed: ${response.status}`);
  const cookie = cookieHeader(response);
  const session = await fetch(`${socialOrigin}/api/auth/session`, { headers: { cookie } });
  if (!session.ok) throw new Error("Social did not validate its newly created session");
  const body = await session.json() as { user: { userId: string } };
  return { cookie, userId: body.user.userId };
}
async function post(path: string, cookie: string, body: unknown) {
  return fetch(`${courses}${path}`, { method: "POST", headers: { "content-type": "application/json", cookie, origin: courses }, body: JSON.stringify(body) });
}

const identities = await Promise.all(users.map(login));
try {
  const [owner, attacker] = identities;
  if ((await fetch(`${courses}/learn`, { headers: { cookie: owner.cookie } })).status !== 200) throw new Error("authenticated /learn failed");
  if (!(await post("/api/learning/enroll", owner.cookie, { courseSlug: "javascript-fundamentals" })).ok) throw new Error("authenticated enrollment failed");
  if (!(await post("/api/learning/progress", owner.cookie, { courseSlug: "javascript-fundamentals", lessonSlug: "variables-and-data-types" })).ok) throw new Error("authenticated progress failed");
  const practiceResponse = await post("/api/learning/practice", owner.cookie, { courseSlug: "javascript-fundamentals", lessonSlug: "functions-and-control-flow" });
  if (!practiceResponse.ok) throw new Error("authenticated practice generation failed");
  const practice = await practiceResponse.json() as { practiceId: string; questionType: string };
  const attack = await post("/api/learning/practice/evaluate", attacker.cookie, { practiceId: practice.practiceId, studentAnswer: "0" });
  if (attack.status !== 404) throw new Error("cross-user practice isolation failed");
  if (!(await post("/api/learning/practice/evaluate", owner.cookie, { practiceId: practice.practiceId, studentAnswer: practice.questionType === "MULTIPLE_CHOICE" ? "0" : "a reasonable attempt" })).ok) throw new Error("owner practice evaluation failed");
  if (!(await post("/api/ai/tutor", owner.cookie, { courseSlug: "javascript-fundamentals", question: "What is a variable?", lessonSlug: "variables-and-data-types" })).ok) throw new Error("authenticated Tutor failed");
  if (!(await post("/api/ai/learning-coach", owner.cookie, { courseSlug: "javascript-fundamentals" })).ok) throw new Error("authenticated Learning Coach failed");
  const rows = await prisma.studentEnrollment.count({ where: { studentId: owner.userId } });
  if (rows !== 1) throw new Error("Courses rows did not use the verified Social user id");
  const logout = await fetch(`${socialOrigin}/api/auth/logout`, { method: "POST", headers: { cookie: owner.cookie, origin: socialOrigin } });
  if (!logout.ok) throw new Error("Social logout failed");
  const afterLogout = await fetch(`${courses}/learn`);
  if (afterLogout.ok) throw new Error("protected access succeeded after cleared logout cookies");
  console.log("Authenticated Social -> Courses identity smoke passed.");
} finally {
  for (const { userId } of identities) {
    await prisma.practiceSession.deleteMany({ where: { studentId: userId } });
    await prisma.learningActivity.deleteMany({ where: { studentId: userId } });
    await prisma.lessonProgress.deleteMany({ where: { studentId: userId } });
    await prisma.studentEnrollment.deleteMany({ where: { studentId: userId } });
  }
  await prisma.$disconnect();
}