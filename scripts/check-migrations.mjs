// Static validation of the migration folder.
//
// A full clean-room replay is not possible today: src/db/schema.sql already
// contains columns that early migrations also add, so the two bootstrap paths
// overlap and `db:migrate` on an empty database fails at migration 1. Until
// that is reconciled this catches the mistakes that are catchable - a file that
// does not parse, one missing up/down, or a duplicated timestamp prefix, any of
// which would otherwise fail the deploy rather than a pull request.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = join(process.cwd(), "src/db/migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".js")).sort();

let bad = 0;
const seen = new Map();

for (const f of files) {
  const prefix = f.split("-")[0];
  if (!/^\d{14}$/.test(prefix)) {
    console.error(`  x ${f}: filename must start with a 14-digit timestamp`);
    bad++;
  }
  if (seen.has(prefix)) {
    console.error(`  x ${f}: duplicate timestamp, also used by ${seen.get(prefix)}`);
    bad++;
  }
  seen.set(prefix, f);

  try {
    const mod = await import(pathToFileURL(join(dir, f)).href);
    const m = mod.default ?? mod;
    for (const hook of ["up", "down"]) {
      if (typeof m[hook] !== "function") {
        console.error(`  x ${f}: missing ${hook}()`);
        bad++;
      }
    }
  } catch (e) {
    console.error(`  x ${f}: ${e.message}`);
    bad++;
  }
}

console.log(`  ${files.length} migrations checked, ${bad} problem(s)`);
process.exit(bad === 0 ? 0 : 1);
