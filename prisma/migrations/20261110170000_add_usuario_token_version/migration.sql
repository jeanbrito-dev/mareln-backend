-- Adiciona controle de versão das sessões dos usuários.
-- Todos os usuários existentes começam com a versão 0.

ALTER TABLE "Usuario"
ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;