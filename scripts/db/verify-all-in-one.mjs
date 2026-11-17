#!/usr/bin/env node
/**
 * Checks supabase/ALL-IN-ONE.sql on a real Postgres engine (PGlite, in-process):
 *   1. it runs clean on an empty database,
 *   2. it runs clean a second time (safe to paste twice),
 *   3. it creates the same tables, columns, policies and functions as running
 *      the 7 migration files one by one,
 *   4. seed.sql still loads on top of it.
 *
 *   node scripts/db/verify-all-in-one.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const stub = read("scripts/db/supabase-stub.sql");

async function fresh() {
  const db = new PGlite({ extensions: { btree_gist } });
  await db.exec(stub);
  return db;
}

async function shape(db) {
  const q = async (sql) => (await db.query(sql)).rows.map((r) => Object.values(r).join(" ")).sort();
  return {
    columns: await q(`select table_schema, table_name, column_name, data_type from information_schema.columns
                      where table_schema in ('public','storage') order by 1,2,3`),
    policies: await q(`select schemaname, tablename, policyname, cmd from pg_policies order by 1,2,3`),
    functions: await q(`select n.nspname, p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                        where n.nspname='public' order by 1,2`),
    triggers: await q(`select event_object_table, trigger_name from information_schema.triggers order by 1,2`),
  };
}

let fail = 0;
const ok = (name, cond, detail = "") => { console.log(`  ${cond ? "✓" : "✗"} ${name}${!cond && detail ? " — " + detail : ""}`); if (!cond) fail++; };

const all = read("supabase/ALL-IN-ONE.sql");
const a = await fresh();
try { await a.exec(all); ok("ALL-IN-ONE.sql runs on an empty database", true); } catch (e) { ok("ALL-IN-ONE.sql runs on an empty database", false, e.message); }
try { await a.exec(all); ok("ALL-IN-ONE.sql runs a second time", true); } catch (e) { ok("ALL-IN-ONE.sql runs a second time", false, e.message); }
try { await a.exec(read("supabase/seed.sql")); ok("seed.sql loads on top", true); } catch (e) { ok("seed.sql loads on top", false, e.message); }

const b = await fresh();
for (const f of readdirSync(join(root, "supabase/migrations")).filter((f) => f.endsWith(".sql")).sort())
  await b.exec(read(`supabase/migrations/${f}`));
const [sa, sb] = [await shape(a), await shape(b)];
for (const k of Object.keys(sa)) {
  const missing = sb[k].filter((x) => !sa[k].includes(x));
  const extra = sa[k].filter((x) => !sb[k].includes(x));
  ok(`same ${k} as the 7 files (${sb[k].length})`, !missing.length && !extra.length,
     `missing: ${missing.slice(0, 5).join("; ")} extra: ${extra.slice(0, 5).join("; ")}`);
}
console.log(fail ? `\n${fail} check(s) failed` : "\nAll checks passed");
process.exit(fail ? 1 : 0);
