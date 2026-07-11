/*
  Warnings:

  - You are about to drop the column `location` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Restaurant` table. All the data in the column will be lost.
  - Added the required column `address` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Restaurant_title_idx";

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "location",
DROP COLUMN "title",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "previewImageUrl" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Restaurant_name_idx" ON "Restaurant"("name");
