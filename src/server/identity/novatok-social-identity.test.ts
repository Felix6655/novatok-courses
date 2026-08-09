import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCoursesSessionToken } from "@/server/auth/courses-auth";
import { getNovaTokSocialIdentity, InvalidSocialSessionError } from "@/server/identity/novatok-social-identity";

const SECRET = "s".repeat(48);
const USER_ID = "10000000-0000-4000-8000-000000000001";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test"); vi.stubEnv("NOVATOK_SOCIAL_ORIGIN", "https://social.example");
  vi.stubEnv("NOVATOK_SOCIAL_CLIENT_ID", "novatok-courses"); vi.stubEnv("NOVATOK_SOCIAL_CLIENT_SECRET", "c".repeat(48));
  vi.stubEnv("NOVATOK_COURSES_ORIGIN", "https://courses.example"); vi.stubEnv("NOVATOK_COURSES_SESSION_SECRET", SECRET);
});
afterEach(() => vi.unstubAllEnvs());

describe("getNovaTokSocialIdentity", () => {
  it("uses the verified local Courses session UUID without contacting Social", async () => {
    await expect(getNovaTokSocialIdentity(createCoursesSessionToken(USER_ID, SECRET))).resolves.toEqual({ studentId: USER_ID });
  });
  it("rejects missing, tampered, and expired Courses sessions", async () => {
    await expect(getNovaTokSocialIdentity(undefined)).rejects.toBeInstanceOf(InvalidSocialSessionError);
    const token = createCoursesSessionToken(USER_ID, SECRET, 1_000);
    await expect(getNovaTokSocialIdentity(`${token}x`)).rejects.toBeInstanceOf(InvalidSocialSessionError);
    vi.spyOn(Date, "now").mockReturnValue((1_000 + 901) * 1_000);
    await expect(getNovaTokSocialIdentity(token)).rejects.toBeInstanceOf(InvalidSocialSessionError);
    vi.restoreAllMocks();
  });
});
