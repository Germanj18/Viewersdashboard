/*
  Warnings:

  - You are about to drop the column `channel_name` on the `ExcelData` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `ExcelData` table. All the data in the column will be lost.
  - You are about to drop the column `hora` on the `ExcelData` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `ExcelData` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ExcelData` table. All the data in the column will be lost.
  - You are about to drop the column `youtube` on the `ExcelData` table. All the data in the column will be lost.
  - Added the required column `azz` to the `ExcelData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blender` to the `ExcelData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bondi` to the `ExcelData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carajo` to the `ExcelData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `ExcelData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gelatina` to the `ExcelData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hour` to the `ExcelData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lacasa` to the `ExcelData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `luzu` to the `ExcelData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `olga` to the `ExcelData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vorterix` to the `ExcelData` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ExcelData_fecha_key";

-- AlterTable
ALTER TABLE "ExcelData" DROP COLUMN "channel_name",
DROP COLUMN "fecha",
DROP COLUMN "hora",
DROP COLUMN "likes",
DROP COLUMN "title",
DROP COLUMN "youtube",
ADD COLUMN     "azz" INTEGER NOT NULL,
ADD COLUMN     "blender" INTEGER NOT NULL,
ADD COLUMN     "bondi" INTEGER NOT NULL,
ADD COLUMN     "carajo" INTEGER NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "gelatina" INTEGER NOT NULL,
ADD COLUMN     "hour" TEXT NOT NULL,
ADD COLUMN     "lacasa" INTEGER NOT NULL,
ADD COLUMN     "luzu" INTEGER NOT NULL,
ADD COLUMN     "olga" INTEGER NOT NULL,
ADD COLUMN     "vorterix" INTEGER NOT NULL;
