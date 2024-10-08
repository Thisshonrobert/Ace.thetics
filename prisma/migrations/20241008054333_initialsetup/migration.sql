-- CreateTable
CREATE TABLE "Celebrity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dp" TEXT NOT NULL,
    "socialmediaId" TEXT NOT NULL,

    CONSTRAINT "Celebrity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "brandname" TEXT NOT NULL,
    "seoname" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "celebrityId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostProduct" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "PostProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Celebrity_socialmediaId_key" ON "Celebrity"("socialmediaId");

-- CreateIndex
CREATE INDEX "Celebrity_name_idx" ON "Celebrity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_link_key" ON "Product"("link");

-- CreateIndex
CREATE UNIQUE INDEX "Product_imageUrl_key" ON "Product"("imageUrl");

-- CreateIndex
CREATE INDEX "Product_shop_category_idx" ON "Product"("shop", "category");

-- CreateIndex
CREATE INDEX "Post_celebrityId_idx" ON "Post"("celebrityId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_celebrityId_fkey" FOREIGN KEY ("celebrityId") REFERENCES "Celebrity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostProduct" ADD CONSTRAINT "PostProduct_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostProduct" ADD CONSTRAINT "PostProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
