/*
  Warnings:

  - You are about to drop the column `tempC` on the `BakeStep` table. All the data in the column will be lost.
  - You are about to drop the column `tempC` on the `RecipeStep` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BakeStep" DROP COLUMN "tempC",
ADD COLUMN     "tempF" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "RecipeStep" DROP COLUMN "tempC",
ADD COLUMN     "tempF" DOUBLE PRECISION;
