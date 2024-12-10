-- CreateEnum
CREATE TYPE "Profession" AS ENUM ('actor', 'actress', 'artist', 'sports', 'other');

-- AlterTable
ALTER TABLE "Celebrity" ADD COLUMN     "country" TEXT,
ADD COLUMN     "profession" "Profession";
