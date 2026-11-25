ALTER TABLE "CreditLedger" ADD COLUMN "nowpaymentsPaymentId" TEXT;

CREATE UNIQUE INDEX "CreditLedger_nowpaymentsPaymentId_key" ON "CreditLedger"("nowpaymentsPaymentId");

CREATE TABLE "CryptoInvoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "nowpaymentsInvoiceId" TEXT,
    "paymentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoInvoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CryptoInvoice_nowpaymentsInvoiceId_key" ON "CryptoInvoice"("nowpaymentsInvoiceId");

CREATE UNIQUE INDEX "CryptoInvoice_paymentId_key" ON "CryptoInvoice"("paymentId");

CREATE INDEX "CryptoInvoice_userId_createdAt_idx" ON "CryptoInvoice"("userId", "createdAt");

ALTER TABLE "CryptoInvoice" ADD CONSTRAINT "CryptoInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
