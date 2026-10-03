import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export type TermJson = {
  id: string;
  word: string;
  description: string;
  createdAt?: Date;
};

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
