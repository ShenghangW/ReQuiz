import { jsonError } from "@/lib/api";
import { ensureLibrary, isUuid } from "@/lib/library";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const library = await ensureLibrary();
  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError("Term not found.", 404);
  }

  const result = await prisma.term.deleteMany({
    where: { id, libraryId: library.id },
  });

  if (result.count === 0) {
    return jsonError("Term not found.", 404);
  }

  return new Response(null, { status: 204 });
}
