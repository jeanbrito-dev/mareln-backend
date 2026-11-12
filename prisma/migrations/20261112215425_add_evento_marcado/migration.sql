-- CreateTable
CREATE TABLE "EventoMarcado" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "eventoId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoMarcado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventoMarcado_eventoId_idx" ON "EventoMarcado"("eventoId");

-- CreateIndex
CREATE UNIQUE INDEX "EventoMarcado_usuarioId_eventoId_key" ON "EventoMarcado"("usuarioId", "eventoId");

-- AddForeignKey
ALTER TABLE "EventoMarcado" ADD CONSTRAINT "EventoMarcado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoMarcado" ADD CONSTRAINT "EventoMarcado_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
