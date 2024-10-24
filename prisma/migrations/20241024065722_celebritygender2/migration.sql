/*
  Warnings:

  - The `gender` column on the `Celebrity` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'nil');

-- AlterTable
ALTER TABLE "Celebrity" DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender";
