-- DropIndex
DROP INDEX "Product_shop_category_idx";

-- CreateIndex
CREATE INDEX "Product_shop_brandname_idx" ON "Product"("shop", "brandname");
