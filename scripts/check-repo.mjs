/**
 * Repository guard.
 *
 * A second Next.js project (65roses) lives on the same machine with a
 * near-identical stack. Work has leaked between the two before. This runs
 * before dev, build, test and db:reset, and refuses to continue if either the
 * package identity or the database looks like it belongs to something else.
 *
 * Honest about its limit: this can only fire from inside this repository, so
 * it cannot detect that you meant to be in the other one. Its real job is to
 * stop a terraos command from operating on a database that is not terraos —
 * db:reset drops every table without asking, and there is no undo.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const EXPECTED_NAME = "terra-os";
const REQUIRED_DB_FRAGMENT = "terraos";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function fail(lines) {
  console.error(`\n  ✖ Wrong repository, or wrong database.\n`);
  for (const line of lines) console.error(`    ${line}`);
  console.error("");
  process.exit(1);
}

// ── Identity ────────────────────────────────────────────────────────────────
let pkg;
try {
  pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
} catch {
  fail(["package.json could not be read at " + root]);
}

if (pkg.name !== EXPECTED_NAME) {
  fail([
    `package.json name is "${pkg.name}", expected "${EXPECTED_NAME}".`,
    "",
    "This is TERRA OS. If you meant 65roses, you are in the wrong directory.",
  ]);
}

// ── Database ────────────────────────────────────────────────────────────────
// Read .env directly rather than depending on dotenv: the guard has to work
// before anything else in the toolchain has loaded.
function readDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const file of [".env.local", ".env"]) {
    try {
      const contents = readFileSync(join(root, file), "utf8");
      const match = contents.match(/^\s*DATABASE_URL\s*=\s*"?([^"\n\r]+)"?/m);
      if (match) return match[1].trim();
    } catch {
      // Absent file is fine; try the next one.
    }
  }
  return null;
}

const url = readDatabaseUrl();

// No URL at all is a setup problem, not a safety problem — say so and stop.
if (!url) {
  fail([
    "No DATABASE_URL found in the environment, .env.local or .env.",
    "Copy .env.example and set it before running this command.",
  ]);
}

// Everything after the last slash, minus any query string, is the database.
const database = (url.split("/").pop() ?? "").split("?")[0];

if (!database.toLowerCase().includes(REQUIRED_DB_FRAGMENT)) {
  fail([
    `DATABASE_URL points at the database "${database}".`,
    `A Terra OS database name must contain "${REQUIRED_DB_FRAGMENT}".`,
    "",
    "`npm run db:reset` drops every table at this URL without asking.",
    "Refusing to run against a database that may belong to another project.",
  ]);
}
