-- CreateEnum
CREATE TYPE "OrganiserApplicationStatus" AS ENUM ('SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "OrganiserApplication" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "organisationName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "website" TEXT,
    "city" TEXT,
    "status" "OrganiserApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganiserApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganiserApplication_accountId_idx" ON "OrganiserApplication"("accountId");

CREATE INDEX "OrganiserApplication_status_idx" ON "OrganiserApplication"("status");

-- AddForeignKey
ALTER TABLE "OrganiserApplication" ADD CONSTRAINT "OrganiserApplication_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganiserApplication" ADD CONSTRAINT "OrganiserApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
