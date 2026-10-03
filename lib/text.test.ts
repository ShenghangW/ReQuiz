import { describe, expect, it } from "vitest";
import { chunkDescription, normaliseGuess } from "./text";

describe("normaliseGuess", () => {
  it("trims, lowercases, and collapses internal spaces", () => {
    expect(normaliseGuess("  Software   Engineer  ")).toBe("software engineer");
  });

  it("matches multi-word terms exactly after normalisation", () => {
    expect(normaliseGuess("software engineer")).toBe(
      normaliseGuess("Software Engineer"),
    );
    expect(normaliseGuess("software engineer")).not.toBe(
      normaliseGuess("software"),
    );
  });

  it("applies Unicode NFKC before comparing", () => {
    const ligatureFi = "ﬁnal"; // U+FB01 LATIN SMALL LIGATURE FI
    expect(normaliseGuess(ligatureFi)).toBe("final");
  });

  it("strips digits, symbols, and punctuation; keeps letters and spaces", () => {
    expect(normaliseGuess("API!")).toBe("api");
    expect(normaliseGuess("hackathon-2026")).toBe("hackathon");
    expect(normaliseGuess("data_base")).toBe("database");
    expect(normaliseGuess("software-engineer")).toBe("softwareengineer");
  });

  it("returns empty string when nothing remains after stripping", () => {
    expect(normaliseGuess("   ")).toBe("");
    expect(normaliseGuess("123")).toBe("");
    expect(normaliseGuess("!!!")).toBe("");
    expect(normaliseGuess("  42  ")).toBe("");
  });

  it("collapses spaces left after stripping digits in the middle", () => {
    expect(normaliseGuess("foo 99 bar")).toBe("foo bar");
  });
});

describe("chunkDescription", () => {
  it("returns an empty array for blank input", () => {
    expect(chunkDescription("")).toEqual([]);
    expect(chunkDescription("   \n\t  ")).toEqual([]);
  });

  it("keeps a one-word description as a single chunk", () => {
    expect(chunkDescription("JSON")).toEqual(["JSON"]);
  });

  it("splits a long single-sentence paragraph into six even word chunks", () => {
    const words = Array.from({ length: 90 }, (_, i) => `w${i + 1}`);
    const chunks = chunkDescription(words.join(" "));
    expect(chunks).toHaveLength(6);
    expect(chunks.every((chunk) => wordCount(chunk) === 15)).toBe(true);
    expect(chunks.join(" ")).toBe(words.join(" "));
  });

  it("uses sentence packing when there are two or more sentences", () => {
    const text =
      "First sentence is short. Second sentence is also fairly short.";
    const chunks = chunkDescription(text);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toBe("First sentence is short.");
    expect(chunks[1]).toBe("Second sentence is also fairly short.");
  });

  it("caps sentence chunks at six even when there are more sentences", () => {
    const sentences = Array.from(
      { length: 8 },
      (_, i) => `Sentence number ${i + 1} goes here.`,
    );
    const chunks = chunkDescription(sentences.join(" "));
    expect(chunks.length).toBe(6);
    expect(chunks.join(" ")).toBe(sentences.join(" "));
    // 8 equal 5-word sentences → two chunks hold two sentences (10 words).
    const wordsPerChunk = chunks.map(wordCount);
    expect(wordsPerChunk.reduce((a, b) => a + b, 0)).toBe(40);
    expect(Math.min(...wordsPerChunk)).toBe(5);
    expect(Math.max(...wordsPerChunk)).toBe(10);
    expect(chunks.filter((chunk) => wordCount(chunk) === 10)).toHaveLength(2);
  });

  it("collapses whitespace before chunking", () => {
    const chunks = chunkDescription("Alpha.   Beta.\n\nGamma.");
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toBe("Alpha.");
  });

  it("splits a terminator-free description on words, up to six chunks", () => {
    const words = ["one", "two", "three", "four", "five", "six", "seven"];
    const chunks = chunkDescription(words.join(" "));
    expect(chunks.length).toBe(6);
    expect(chunks.join(" ").split(" ")).toEqual(words);
  });

  it("does not exceed the word count when there are fewer than six words", () => {
    expect(chunkDescription("one two three")).toHaveLength(3);
  });
});

function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}
