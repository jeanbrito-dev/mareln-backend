-- CreateEnum
CREATE TYPE "StatusEvento" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- AlterTable
-- Eventos existentes recebem APROVADO.
ALTER TABLE "Evento"
ADD COLUMN "status" "StatusEvento" NOT NULL DEFAULT 'APROVADO';

-- Novos eventos recebem PENDENTE automaticamente.
ALTER TABLE "Evento"
ALTER COLUMN "status" SET DEFAULT 'PENDENTE';
