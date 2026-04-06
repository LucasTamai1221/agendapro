-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT,
    "cliente_nome" TEXT NOT NULL,
    "servico" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "pagamento_status" TEXT NOT NULL DEFAULT 'pendente',
    "pagamento_id" TEXT,
    "pix_code" TEXT,
    "pix_qr_code_url" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
