-- CreateEnum
CREATE TYPE "TranscriptionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "transcriptions" (
    "id" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "storedFilename" TEXT NOT NULL,
    "detectedLanguage" TEXT,
    "transcriptionText" TEXT,
    "translatedText" TEXT,
    "targetLanguage" TEXT,
    "durationSeconds" DOUBLE PRECISION,
    "status" "TranscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transcriptions_status_idx" ON "transcriptions"("status");
