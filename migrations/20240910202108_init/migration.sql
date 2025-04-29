-- CreateTable
CREATE TABLE "Programas" (
    "id" SERIAL NOT NULL,
    "programa" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "real" INTEGER NOT NULL,
    "chimi" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "media_real" DOUBLE PRECISION NOT NULL,
    "media_total" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Programas_pkey" PRIMARY KEY ("id")
);
