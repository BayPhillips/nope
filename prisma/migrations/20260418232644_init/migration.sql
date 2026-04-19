-- CreateEnum
CREATE TYPE "StepType" AS ENUM ('AUTOLYSE', 'MIX', 'BULK_FERMENT', 'FOLD', 'PRESHAPE', 'BENCH_REST', 'SHAPE', 'PROOF', 'COLD_PROOF', 'SCORE', 'BAKE', 'COOL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weightG" DOUBLE PRECISION NOT NULL,
    "isFlour" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeStep" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "type" "StepType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "durationMins" INTEGER,
    "tempC" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RecipeStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BakeSession" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BakeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BakeStep" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "StepType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "durationMins" INTEGER,
    "tempC" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BakeStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BakeLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "rating" INTEGER,
    "outcomeNotes" TEXT,
    "improvementNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BakeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BakeLog_sessionId_key" ON "BakeLog"("sessionId");

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BakeSession" ADD CONSTRAINT "BakeSession_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BakeStep" ADD CONSTRAINT "BakeStep_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "BakeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BakeLog" ADD CONSTRAINT "BakeLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "BakeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
