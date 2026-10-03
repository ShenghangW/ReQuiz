import { describe, expect, it } from "vitest";
import { collapseTerm, termKey, validateNewTerm } from "./term";

describe("collapseTerm", () => {
  it("trims and collapses internal spaces", () => {
    expect(collapseTerm("  Software   Engineer  ")).toBe("Software Engineer");
  });
});

describe("validateNewTerm", () => {
  it("accepts a multi-word term and keeps casing", () => {
    const result = validateNewTerm({
      word: "  Software  Engineer ",
      description: "Builds software.",
    });
    expect(result).toEqual({
      ok: true,
      word: "Software Engineer",
      description: "Builds software.",
    });
  });

  it("accepts term as an alias for word", () => {
    const result = validateNewTerm({
      term: "API",
      description: "An interface.",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.word).toBe("API");
      expect(termKey(result.word)).toBe("api");
    }
  });

  it("rejects blank fields", () => {
    expect(validateNewTerm({ word: "   ", description: "x" }).ok).toBe(false);
    expect(validateNewTerm({ word: "API", description: "  " }).ok).toBe(false);
    expect(validateNewTerm(null).ok).toBe(false);
  });

  it("rejects digits, punctuation, and leading spaces after collapse", () => {
    expect(validateNewTerm({ word: "hackathon-2026", description: "x" }).ok).toBe(
      false,
    );
    expect(validateNewTerm({ word: "2fast", description: "x" }).ok).toBe(false);
  });

  it("rejects over-long term or description", () => {
    expect(
      validateNewTerm({ word: "a".repeat(81), description: "ok" }).ok,
    ).toBe(false);
    expect(
      validateNewTerm({ word: "api", description: "d".repeat(4001) }).ok,
    ).toBe(false);
  });
});
