/*
  Warnings:

  - The `imageUrl` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrl" TEXT[];

-- AlterTable
ALTER TABLE "users" DROP COLUMN "gender";
