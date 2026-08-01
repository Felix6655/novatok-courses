import { describe, expect, it } from "vitest";
import { parseJsonLoosely } from "@/ai/parse-json-loosely";

describe("parseJsonLoosely", () => {
  it("parses well-formed JSON directly", () => {
    expect(parseJsonLoosely('{"a":1}')).toEqual({ a: 1 });
  });

  it("repairs JSON wrapped in prose", () => {
    expect(parseJsonLoosely('Sure, here you go:\n{"a":1}\nHope that helps!')).toEqual({ a: 1 });
  });

  it("repairs JSON wrapped in a markdown fence", () => {
    expect(parseJsonLoosely('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("returns undefined for text with no JSON object", () => {
    expect(parseJsonLoosely("no json here")).toBeUndefined();
  });

  it("returns undefined for unrepairable malformed JSON", () => {
    expect(parseJsonLoosely("{a: 1, this is not valid json,}")).toBeUndefined();
  });
});
