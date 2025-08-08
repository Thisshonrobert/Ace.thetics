-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_celebrityId_fkey";

-- DropForeignKey
ALTER TABLE "PostProduct" DROP CONSTRAINT "PostProduct_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostProduct" DROP CONSTRAINT "PostProduct_productId_fkey";

-- AlterTable
ALTER TABLE "_Likes" ADD CONSTRAINT "_Likes_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_Likes_AB_unique";

-- AlterTable
ALTER TABLE "_wishlist" ADD CONSTRAINT "_wishlist_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_wishlist_AB_unique";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_celebrityId_fkey" FOREIGN KEY ("celebrityId") REFERENCES "Celebrity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostProduct" ADD CONSTRAINT "PostProduct_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostProduct" ADD CONSTRAINT "PostProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
