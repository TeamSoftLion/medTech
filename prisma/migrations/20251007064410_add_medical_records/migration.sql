/*
  Warnings:

  - Changed the type of `type` on the `MedicalRecord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."RecordType" AS ENUM ('diagnosis', 'treatment', 'note');

-- AlterTable
ALTER TABLE "public"."MedicalRecord" DROP COLUMN "type",
ADD COLUMN     "type" "public"."RecordType" NOT NULL;

-- CreateIndex
CREATE INDEX "MedicalRecord_patientId_createdAt_idx" ON "public"."MedicalRecord"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "MedicalRecord_authorId_createdAt_idx" ON "public"."MedicalRecord"("authorId", "createdAt");
