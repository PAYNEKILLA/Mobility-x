-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "registrationNumber" TEXT,
    "maxWeightKg" DOUBLE PRECISION NOT NULL,
    "maxPackageCount" INTEGER NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "lengthCm" DOUBLE PRECISION NOT NULL,
    "widthCm" DOUBLE PRECISION NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "description" TEXT,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "pickupLatitude" DOUBLE PRECISION NOT NULL,
    "pickupLongitude" DOUBLE PRECISION NOT NULL,
    "destinationAddress" TEXT NOT NULL,
    "destinationLatitude" DOUBLE PRECISION NOT NULL,
    "destinationLongitude" DOUBLE PRECISION NOT NULL,
    "option" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "requestedPickupTime" TIMESTAMP(3),
    "deliveryDeadline" TIMESTAMP(3),
    "estimatedPrice" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "originAddress" TEXT NOT NULL,
    "originLatitude" DOUBLE PRECISION NOT NULL,
    "originLongitude" DOUBLE PRECISION NOT NULL,
    "destinationAddress" TEXT NOT NULL,
    "destinationLatitude" DOUBLE PRECISION NOT NULL,
    "destinationLongitude" DOUBLE PRECISION NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "estimatedArrivalTime" TIMESTAMP(3),
    "availablePackageCount" INTEGER NOT NULL,
    "availableWeightKg" DOUBLE PRECISION NOT NULL,
    "acceptedCategories" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "tripId" TEXT,
    "partnerId" TEXT NOT NULL,
    "compatibilityScore" INTEGER NOT NULL,
    "routeCompatibility" INTEGER NOT NULL,
    "timeCompatibility" INTEGER NOT NULL,
    "detourDistanceKm" DOUBLE PRECISION NOT NULL,
    "estimatedExtraMinutes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offered',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider" TEXT,
    "providerReference" TEXT,
    "heldAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT,
    "paymentId" TEXT,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_registrationNumber_key" ON "Vehicle"("registrationNumber");

-- CreateIndex
CREATE INDEX "Match_deliveryId_idx" ON "Match"("deliveryId");

-- CreateIndex
CREATE INDEX "Match_tripId_idx" ON "Match"("tripId");

-- CreateIndex
CREATE INDEX "Payment_deliveryId_idx" ON "Payment"("deliveryId");

-- CreateIndex
CREATE INDEX "Transaction_deliveryId_idx" ON "Transaction"("deliveryId");

-- CreateIndex
CREATE INDEX "Transaction_paymentId_idx" ON "Transaction"("paymentId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
