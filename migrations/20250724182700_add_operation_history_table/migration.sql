-- CreateTable
CREATE TABLE "OperationHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blockId" TEXT,
    "blockTitle" TEXT NOT NULL,
    "operationType" TEXT NOT NULL,
    "viewers" INTEGER NOT NULL,
    "orderId" TEXT,
    "orderStatus" TEXT,
    "duration" INTEGER,
    "cost" DOUBLE PRECISION,
    "serviceId" INTEGER,
    "message" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperationHistory_userId_timestamp_idx" ON "OperationHistory"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "OperationHistory_blockTitle_idx" ON "OperationHistory"("blockTitle");

-- AddForeignKey
ALTER TABLE "OperationHistory" ADD CONSTRAINT "OperationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
