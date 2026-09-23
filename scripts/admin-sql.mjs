// Prints ready-to-run SQL that sets up an admin login, for pasting into a hosted
// database's SQL editor (e.g. Neon) when you can't run `npm run admin:create` against it.
//
//   node scripts/admin-sql.mjs <email> <password> [name] [--replace <old-email>]
//
// Without --replace it prints an INSERT (or password reset if the email exists).
// With --replace it rewrites the row that currently has <old-email>.
import { randomBytes, scryptSync } from "node:crypto";

const args = process.argv.slice(2);
const ri = args.indexOf("--replace");
const oldEmail = ri >= 0 ? args.splice(ri, 2)[1] : null;
const [emailRaw, password, ...nameParts] = args;

if (!emailRaw || !password || password.length < 10 || (ri >= 0 && !oldEmail)) {
  console.error('Usage: node scripts/admin-sql.mjs <email> "<password, 10+ chars>" [name] [--replace <old-email>]');
  process.exit(1);
}

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const email = emailRaw.trim().toLowerCase();
const name = nameParts.join(" ") || email.split("@")[0];
const salt = randomBytes(16).toString("hex");
const hash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;

const sql = oldEmail
  ? `UPDATE "User" SET email = ${q(email)}, name = ${q(name)}, role = 'ADMIN', "isActive" = true, "passwordHash" = ${q(hash)}
WHERE email = ${q(oldEmail.trim().toLowerCase())};`
  : `INSERT INTO "User" ("id", "email", "name", "role", "passwordHash")
VALUES (gen_random_uuid()::text, ${q(email)}, ${q(name)}, 'ADMIN', ${q(hash)})
ON CONFLICT ("email") DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", role = 'ADMIN', "isActive" = true;`;

console.log(`\n-- Paste everything below into the Neon SQL Editor and click Run --\n
${sql}

SELECT email, name, role, "isActive", length("passwordHash") AS hash_length FROM "User";
`);
