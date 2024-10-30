-- DropIndex
DROP INDEX "Product_shop_brandname_idx";

-- CreateIndex
CREATE INDEX "Product_shop_category_idx" ON "Product"("shop", "category");
