-- CreateEnum
CREATE TYPE "PrecisaoLocalizacao" AS ENUM ('EXATA', 'APROXIMADA');

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "precisaoLocalizacao" "PrecisaoLocalizacao";
