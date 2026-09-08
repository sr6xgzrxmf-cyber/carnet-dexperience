CREATE TABLE "AdminLoginAttempt" (
    "id" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminLoginAttempt_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdminLoginAttempt_keyHash_createdAt_idx" ON "AdminLoginAttempt"("keyHash", "createdAt");
CREATE INDEX "AdminLoginAttempt_createdAt_idx" ON "AdminLoginAttempt"("createdAt");
