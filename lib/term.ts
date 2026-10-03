export const MAX_TERM_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 4000;
export const MAX_TERMS_PER_LIBRARY = 500;
export const TERM_PATTERN = /^[A-Za-z][A-Za-z ]*$/;

export type ValidTermInput = {
  ok: true;
  word: string;
  description: string;
};

export type InvalidTermInput = {
  ok: false;
  error: string;
};

export type TermValidation = ValidTermInput | InvalidTermInput;

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Collapse a submitted term: trim and squeeze internal spaces. */
export function collapseTerm(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function termKey(word: string): string {
  return collapseTerm(word).toLowerCase();
}

/**
 * Validate a new term payload. Accepts `word` or `term` plus `description`.
 * Stored word keeps the submitted casing after collapse.
 */
export function validateNewTerm(input: unknown): TermValidation {
  if (input === null || typeof input !== "object") {
    return { ok: false, error: "Term and description are required." };
  }

  const body = input as Record<string, unknown>;
  const word = collapseTerm(readString(body.word) || readString(body.term));
  const description = readString(body.description).trim();

  if (!word || !description) {
    return { ok: false, error: "Term and description are required." };
  }

  if (word.length > MAX_TERM_LENGTH) {
    return { ok: false, error: "Term must be at most 80 characters." };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { ok: false, error: "Description must be at most 4000 characters." };
  }

  if (!TERM_PATTERN.test(word)) {
    return {
      ok: false,
      error: "Term may only contain letters and spaces.",
    };
  }

  return { ok: true, word, description };
}
