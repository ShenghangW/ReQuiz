import { NextResponse } from "next/server";
import { isUniqueConstraintError, jsonError } from "@/lib/api";
import { ensureLibrary } from "@/lib/library";
import { prisma } from "@/lib/prisma";
import { MAX_TERMS_PER_LIBRARY, termKey, validateNewTerm } from "@/lib/term";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const library = await ensureLibrary();
  const terms = await prisma.term.findMany({
    where: { libraryId: library.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, word: true, description: true, createdAt: true },
  });
  return NextResponse.json(terms);
}

export async function POST(request: Request) {
  const library = await ensureLibrary();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Term and description are required.", 400);
  }

  const parsed = validateNewTerm(body);
  if (!parsed.ok) {
    return jsonError(parsed.error, 400);
  }

  const count = await prisma.term.count({ where: { libraryId: library.id } });
  if (count >= MAX_TERMS_PER_LIBRARY) {
    return jsonError("This library already has 500 terms.", 400);
  }

  try {
    const term = await prisma.term.create({
      data: {
        libraryId: library.id,
        word: parsed.word,
        wordKey: termKey(parsed.word),
        description: parsed.description,
      },
      select: { id: true, word: true, description: true, createdAt: true },
    });
    return NextResponse.json(term, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return jsonError("That term is already in this library.", 409);
    }
    throw error;
  }
}
