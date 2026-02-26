-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'COACH', 'STAFF');

-- CreateEnum
CREATE TYPE "PaymentMethodAtVenue" AS ENUM ('CASH', 'CARD_AT_VENUE');

-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('CLASS', 'INDIVIDUAL_TRAINING', 'BOOTCAMP', 'TOURNAMENT');

-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('PADEL', 'BEACH_TENNIS', 'BEACH_VOLLEYBALL', 'FOOTBALL_PADEL', 'YOGA', 'MOUNTAIN_BIKING', 'HIKING', 'DANCE_CLASSES', 'BRAZILIAN_JIUJITSU', 'BOXING');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'WAITLIST');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NONE', 'PENDING', 'PAID', 'REFUNDED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "surname" TEXT,
    "phone" TEXT,
    "gender" TEXT,
    "avatarUrl" TEXT,
    "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationMember" (
    "id" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL,
    "accountId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganisationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'DE',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Berlin',
    "organisationId" TEXT,
    "paymentMethodsAtVenue" "PaymentMethodAtVenue"[] DEFAULT ARRAY[]::"PaymentMethodAtVenue"[],
    "claimedAt" TIMESTAMP(3),
    "claimedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "offerType" "OfferType" NOT NULL DEFAULT 'CLASS',
    "sportType" "SportType" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "ClassStatus" NOT NULL DEFAULT 'DRAFT',
    "locationId" TEXT NOT NULL,
    "organiserId" TEXT NOT NULL,
    "priceCents" INTEGER,
    "currency" TEXT DEFAULT 'EUR',
    "paymentRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NONE',
    "accountId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "impersonatingId" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationMember_accountId_organisationId_key" ON "OrganisationMember"("accountId", "organisationId");

-- CreateIndex
CREATE INDEX "Class_status_startTime_idx" ON "Class"("status", "startTime");

-- CreateIndex
CREATE INDEX "Class_locationId_idx" ON "Class"("locationId");

-- CreateIndex
CREATE INDEX "Class_sportType_idx" ON "Class"("sportType");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_accountId_classId_key" ON "Booking"("accountId", "classId");

-- AddForeignKey
ALTER TABLE "OrganisationMember" ADD CONSTRAINT "OrganisationMember_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationMember" ADD CONSTRAINT "OrganisationMember_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_organiserId_fkey" FOREIGN KEY ("organiserId") REFERENCES "OrganisationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
