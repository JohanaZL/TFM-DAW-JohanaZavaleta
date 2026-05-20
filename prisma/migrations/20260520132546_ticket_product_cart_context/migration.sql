-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN     "cartProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "productId" TEXT;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
