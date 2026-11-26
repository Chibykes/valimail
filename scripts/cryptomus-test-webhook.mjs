import { createHash } from "node:crypto";

const [id, urlCallback, status = "paid"] = process.argv.slice(2);
const merchant = process.env.CRYPTOMUS_MERCHANT_ID;
const apiKey = process.env.CRYPTOMUS_PAYMENT_API_KEY;

if (!id || !urlCallback || !merchant || !apiKey) {
  console.error(
    "Usage: node --env-file=.env scripts/cryptomus-test-webhook.mjs <uuid-or-order-id> <urlCallback> [status]",
  );
  process.exit(1);
}
if (urlCallback.length > 150) {
  console.error("Cryptomus test url_callback max is 150 characters.");
  process.exit(1);
}

const payload = {
  ...(id.includes("-") ? { uuid: id } : { order_id: id }),
  currency: "USDT",
  network: "tron",
  url_callback: urlCallback,
  status,
};
const body = JSON.stringify(payload).replace(/\//g, "\\/");
const sign = createHash("md5")
  .update(Buffer.from(body, "utf8").toString("base64") + apiKey)
  .digest("hex");

const response = await fetch("https://api.cryptomus.com/v1/test-webhook/payment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    merchant,
    sign,
  },
  body,
});
const text = await response.text();
process.stdout.write(`${response.status} ${text}\n`);
if (!response.ok) process.exit(1);
