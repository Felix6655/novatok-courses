import { describe, expect, it } from "vitest";
import {
  AWS_VERIFIED_RESOURCES,
  findAwsVerifiedResources,
} from "@/server/guided-learning/providers/aws";

describe("AWS verified learning resources", () => {
  it("contains only official AWS URLs", () => {
    for (const resource of AWS_VERIFIED_RESOURCES) {
      expect(new URL(resource.url).hostname).toBe("aws.amazon.com");
      expect(resource.provider).toBe("aws");
      expect(typeof resource.freeAccess).toBe("boolean");
      expect(resource.verification.source).toBe("official-provider");
    }
  });

  it("matches AWS and generative AI goals", () => {
    const resources = findAwsVerifiedResources({
      goal: "Learn generative AI on AWS and Amazon Bedrock",
      currentLevel: "BEGINNER",
      locale: "en",
    });
    expect(resources.some((item) => item.id === "aws-learn-about-ai")).toBe(true);
    expect(resources.some((item) => item.id === "aws-skill-builder")).toBe(true);
  });

  it("does not match an unrelated goal", () => {
    expect(
      findAwsVerifiedResources({
        goal: "Learn restaurant bookkeeping",
        currentLevel: "BEGINNER",
        locale: "en",
      }),
    ).toEqual([]);
  });
});
