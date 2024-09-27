/*
  Warnings:

  - You are about to drop the column `media_real` on the `Programas` table. All the data in the column will be lost.
  - You are about to drop the column `media_total` on the `Programas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Programas" DROP COLUMN "media_real",
DROP COLUMN "media_total";
