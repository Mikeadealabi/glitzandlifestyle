// Idempotent local database bootstrap, run by `npm run dev` (predev).
//   node scripts/ensure-db.mjs            start Postgres, sync schema, seed if empty
//   node scripts/ensure-db.mjs --reseed   same, but always re-seed
// Set GS_SKIP_DB=1 to bypass (e.g. when DATABASE_URL points at a hosted database).
import { execSync, spawnSync } from "node:child_process";

const CONTAINER = "glitz-db";
const reseed = process.argv.includes("--reseed");
if (process.env.GS_SKIP_DB === "1") process.exit(0);

const run = (cmd) => execSync(cmd, { stdio: "inherit" });
const quiet = (cmd) => spawnSync(cmd, { shell: true, encoding: "utf8" });
const sleep = () => execSync(process.platform === "win32" ? 'powershell -Command "Start-Sleep -Seconds 1"' : "sleep 1");

if (quiet("docker info").status !== 0) {
  console.error("\n✗ Docker isn't running. Start Docker Desktop, or set GS_SKIP_DB=1 with a hosted DATABASE_URL.\n");
  process.exit(1);
}
if (!quiet(`docker ps -q --filter "name=^/${CONTAINER}$" --filter status=running`).stdout.trim()) {
  console.log("· starting Postgres (docker compose up -d)");
  run("docker compose up -d");
}
let ready = false;
for (let i = 0; i < 30 && !ready; i++) {
  ready = quiet(`docker exec ${CONTAINER} pg_isready -U glitz -d glitz`).status === 0;
  if (!ready) sleep();
}
if (!ready) {
  console.error(`✗ Postgres never became ready. Check: docker logs ${CONTAINER}`);
  process.exit(1);
}
console.log("· syncing schema");
run("npx prisma db push --skip-generate");
const c = quiet(`docker exec ${CONTAINER} psql -U glitz -d glitz -tAc "SELECT count(*) FROM \\"Story\\";"`);
const count = parseInt(c.stdout.trim(), 10) || 0;
if (reseed || count === 0) {
  console.log("· seeding sample content");
  run("npx tsx prisma/seed.ts");
}
