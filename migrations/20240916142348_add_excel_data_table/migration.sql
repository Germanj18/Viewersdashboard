-- CreateTable
CREATE TABLE "ExcelData" (
    "id" SERIAL NOT NULL,
    "channel_name" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "youtube" INTEGER NOT NULL,
    "likes" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "ExcelData_pkey" PRIMARY KEY ("id")
);
