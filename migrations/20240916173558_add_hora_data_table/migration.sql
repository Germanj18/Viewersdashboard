/*
  Warnings:

  - Added the required column `hora` to the `ExcelData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExcelData" ADD COLUMN     "hora" TEXT NOT NULL;
