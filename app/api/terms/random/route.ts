import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { ensureLibrary, isUuid } from "@/lib/library";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const library = await ensureLibrary();
  const excludeId = new URL(request.url).searchParams.get("excludeId");

  const total = await prisma.term.count({
    where: { libraryId: library.id },
  });

  if (total === 0) {
    return jsonError("No terms in this library.", 404);
  }

  const exclude =
    total >= 2 && excludeId && isUuid(excludeId) ? excludeId : undefined;

  const terms = await prisma.term.findMany({
    where: {
      libraryId: library.id,
      ...(exclude ? { NOT: { id: exclude } } : {}),
    },
    select: { id: true, word: true, description: true },
  });

  if (terms.length === 0) {
    return jsonError("No terms in this library.", 404);
  }

  const pick = terms[Math.floor(Math.random() * terms.length)];
  return NextResponse.json(pick);
}
