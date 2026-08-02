import { afterEach, describe, expect, it, vi } from "vitest";
import { EnvValidationError } from "@/lib/env";
import { getNovaTokSocialIdentity, InvalidSocialSessionError } from "@/server/identity/novatok-social-identity";

afterEach(() => vi.unstubAllEnvs());

describe("getNovaTokSocialIdentity", () => {
  it("forwards the incoming cookie and returns the verified Social user id", async () => {
    vi.stubEnv("NOVATOK_SOCIAL_ORIGIN", "https://social.example");
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: { userId: "social-user-1" } }), { status: 200 }));
    await expect(getNovaTokSocialIdentity("novatok_session=token", fetchImpl)).resolves.toEqual({ studentId: "social-user-1" });
    expect(fetchImpl).toHaveBeenCalledWith(new URL("https://social.example/api/auth/session"), expect.objectContaining({ headers: { cookie: "novatok_session=token" }, cache: "no-store" }));
  });

  it("rejects invalid and malformed Social sessions", async () => {
    vi.stubEnv("NOVATOK_SOCIAL_ORIGIN", "https://social.example");
    await expect(getNovaTokSocialIdentity("bad=token", vi.fn().mockResolvedValue(new Response(null, { status: 401 })))).rejects.toBeInstanceOf(InvalidSocialSessionError);
    await expect(getNovaTokSocialIdentity("bad=token", vi.fn().mockResolvedValue(new Response(JSON.stringify({ nope: true }), { status: 200 })))).rejects.toBeInstanceOf(InvalidSocialSessionError);
  });

  it("fails clearly when the Social origin is missing", async () => {
    vi.stubEnv("NOVATOK_SOCIAL_ORIGIN", "");
    await expect(getNovaTokSocialIdentity("cookie=x", vi.fn())).rejects.toBeInstanceOf(EnvValidationError);
  });
});