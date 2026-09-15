-- CreateTable
CREATE TABLE "DeliveryConfirmation" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryConfirmation_deliveryId_key" ON "DeliveryConfirmation"("deliveryId");

-- CreateIndex
CREATE INDEX "DeliveryConfirmation_customerId_idx" ON "DeliveryConfirmation"("customerId");

-- AddForeignKey
ALTER TABLE "DeliveryConfirmation" ADD CONSTRAINT "DeliveryConfirmation_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryConfirmation" ADD CONSTRAINT "DeliveryConfirmation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
