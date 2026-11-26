ALTER TABLE "CreditLedger" ADD COLUMN "cryptomusPaymentId" TEXT;

CREATE UNIQUE INDEX "CreditLedger_cryptomusPaymentId_key" ON "CreditLedger"("cryptomusPaymentId");

ALTER TABLE "CryptoInvoice" ADD COLUMN "cryptomusUuid" TEXT;

CREATE UNIQUE INDEX "CryptoInvoice_cryptomusUuid_key" ON "CryptoInvoice"("cryptomusUuid");
