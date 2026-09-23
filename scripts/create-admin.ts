// Create or reset a login:  npm run admin:create -- <email> <password> [ADMIN|EDITOR] [name]
// On an existing email this resets the password only (role and name are kept).
import { PrismaClient, type Role } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const [email, password, role = "ADMIN", ...nameParts] = process.argv.slice(2);
if (!email || !password || password.length < 10 || !["ADMIN", "EDITOR"].includes(role)) {
  console.error("Usage: npm run admin:create -- <email> <password (10+ chars)> [ADMIN|EDITOR] [name]");
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const passwordHash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const db = new PrismaClient();
const user = await db.user.upsert({
  where: { email: email.toLowerCase() },
  update: { passwordHash, isActive: true },
  create: { email: email.toLowerCase(), passwordHash, role: role as Role, name: nameParts.join(" ") || email.split("@")[0] },
});
await db.session.deleteMany({ where: { userId: user.id } });
console.log(`✓ ${user.email} (${user.role}) is ready to sign in.`);
await db.$disconnect();
