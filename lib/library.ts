import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { SEED_TERMS } from "./seeds";
import { termKey } from "./term";

export const LIBRARY_COOKIE = "library_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function cookieSecure(): boolean {
  if (process.env.COOKIE_SECURE === "false") {
    return false;
  }
  if (process.env.COOKIE_SECURE === "true") {
    return true;
  }
  return process.env.NODE_ENV === "production";
}

async function setLibraryCookie(id: string): Promise<void> {
  const store = await cookies();
  store.set(LIBRARY_COOKIE, id, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}

async function createLibraryWithSeeds() {
  return prisma.library.create({
    data: {
      terms: {
        create: SEED_TERMS.map((term) => ({
          word: term.word,
          wordKey: termKey(term.word),
          description: term.description,
        })),
      },
    },
  });
}

/**
 * Resolve this browser's library from the httpOnly cookie.
 * Missing or unknown id → new library + seed terms + new cookie.
 */
export async function ensureLibrary(): Promise<{ id: string }> {
  const store = await cookies();
  const existing = store.get(LIBRARY_COOKIE)?.value;

  if (existing && isUuid(existing)) {
    const found = await prisma.library.findUnique({
      where: { id: existing },
      select: { id: true },
    });
    if (found) {
      return found;
    }
  }

  const library = await createLibraryWithSeeds();
  await setLibraryCookie(library.id);
  return { id: library.id };
}
