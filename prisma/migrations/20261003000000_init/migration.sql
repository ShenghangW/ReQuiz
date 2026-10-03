-- CreateTable
CREATE TABLE "libraries" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "libraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms" (
    "id" UUID NOT NULL,
    "library_id" UUID NOT NULL,
    "word" TEXT NOT NULL,
    "word_key" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "terms_library_id_idx" ON "terms"("library_id");

-- CreateIndex
CREATE UNIQUE INDEX "terms_library_id_word_key_key" ON "terms"("library_id", "word_key");

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_library_id_fkey" FOREIGN KEY ("library_id") REFERENCES "libraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
