-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "cidadePreferida" TEXT,
ADD COLUMN     "fotoPerfilUrl" TEXT,
ADD COLUMN     "interesses" TEXT[] DEFAULT ARRAY[]::TEXT[];
