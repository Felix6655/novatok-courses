import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { toJSONSafe } from "@/lib/serialize";

describe("toJSONSafe", () => {
  it("converts a Decimal to a fixed 2-decimal string", () => {
    expect(toJSONSafe(new Prisma.Decimal("199"))).toBe("199.00");
    expect(toJSONSafe(new Prisma.Decimal("19.5"))).toBe("19.50");
  });

  it("converts a Date to an ISO string", () => {
    const date = new Date("2026-01-01T00:00:00.000Z");
    expect(toJSONSafe(date)).toBe("2026-01-01T00:00:00.000Z");
  });

  it("recurses into nested objects and arrays", () => {
    const input = {
      title: "Course",
      price: new Prisma.Decimal("49.99"),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      tags: ["a", "b"],
      category: {
        name: "AI",
        originalPrice: new Prisma.Decimal("99"),
      },
    };

    expect(toJSONSafe(input)).toEqual({
      title: "Course",
      price: "49.99",
      createdAt: "2026-01-01T00:00:00.000Z",
      tags: ["a", "b"],
      category: {
        name: "AI",
        originalPrice: "99.00",
      },
    });
  });

  it("leaves primitives and null untouched", () => {
    expect(toJSONSafe("hello")).toBe("hello");
    expect(toJSONSafe(42)).toBe(42);
    expect(toJSONSafe(true)).toBe(true);
    expect(toJSONSafe(null)).toBe(null);
  });

  it("serializes an array of Decimals", () => {
    expect(toJSONSafe([new Prisma.Decimal("1"), new Prisma.Decimal("2.5")])).toEqual([
      "1.00",
      "2.50",
    ]);
  });
});
