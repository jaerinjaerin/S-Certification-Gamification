/*
  Warnings:

  - You are about to drop the column `backgroundImageUrl` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `characterImageUrl` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundImageUrl` on the `QuizStage` table. All the data in the column will be lost.
  - You are about to drop the column `badgeImageUrl` on the `QuizStage` table. All the data in the column will be lost.
  - You are about to drop the column `characterImageUrl` on the `QuizStage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "backgroundImageUrl",
DROP COLUMN "characterImageUrl",
ADD COLUMN     "backgroundImageId" TEXT,
ADD COLUMN     "characterImageId" TEXT;

-- AlterTable
ALTER TABLE "QuizStage" DROP COLUMN "backgroundImageUrl",
DROP COLUMN "badgeImageUrl",
DROP COLUMN "characterImageUrl",
ADD COLUMN     "badgeImageId" TEXT;

-- CreateTable
CREATE TABLE "QuizBadge" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "imagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "alt" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "format" TEXT NOT NULL,
    "categories" TEXT[],
    "imagePath" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizStage" ADD CONSTRAINT "QuizStage_badgeImageId_fkey" FOREIGN KEY ("badgeImageId") REFERENCES "QuizBadge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_backgroundImageId_fkey" FOREIGN KEY ("backgroundImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_characterImageId_fkey" FOREIGN KEY ("characterImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
