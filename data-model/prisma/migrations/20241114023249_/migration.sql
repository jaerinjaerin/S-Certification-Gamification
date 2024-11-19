-- DropForeignKey
ALTER TABLE "CountryLanguage" DROP CONSTRAINT "CountryLanguage_languageId_fkey";

-- CreateTable
CREATE TABLE "QuizSetTranslation" (
    "id" SERIAL NOT NULL,
    "language" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "quizSetId" INTEGER NOT NULL,

    CONSTRAINT "QuizSetTranslation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizSetTranslation" ADD CONSTRAINT "QuizSetTranslation_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
