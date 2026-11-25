import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";

const password = readFileSync(0, "utf8").replace(/\r?\n$/, "");
if (password.length < 12) {
  console.error("Use at least 12 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N: 16_384, r: 8, p: 1 });
process.stdout.write(`${salt.toString("hex")}:${hash.toString("hex")}\n`);
