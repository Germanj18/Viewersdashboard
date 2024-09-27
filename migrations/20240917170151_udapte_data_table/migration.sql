/*
  Warnings:

  - A unique constraint covering the columns `[fecha]` on the table `ExcelData` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExcelData_fecha_key" ON "ExcelData"("fecha");
