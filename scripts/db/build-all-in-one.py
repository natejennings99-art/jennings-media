# Rebuilds supabase/ALL-IN-ONE.sql from supabase/migrations. Run from the supabase/ folder:
#   cd supabase && python3 ../scripts/db/build-all-in-one.py
import re,glob,os
files=sorted(glob.glob("migrations/*.sql"))
out=["""-- =============================================================================
-- Jennings Media — ALL-IN-ONE database setup
-- Paste this whole file into Supabase → SQL Editor → Run. Safe to run again:
-- tables, indexes, sequences, triggers and policies are created only if missing
-- (policies and triggers are dropped and re-created so they match this file).
-- Built from the 7 files in supabase/migrations, in this order:
"""]+[f"--   {i+1}. {os.path.basename(f)}\n" for i,f in enumerate(files)]+["-- If you change a migration, rebuild this file instead of editing it by hand.\n-- =============================================================================\n\n"]
for f in files:
    s=open(f).read()
    s=re.sub(r'(?im)^(\s*)create table (?!if not exists)',r'\1create table if not exists ',s)
    s=re.sub(r'(?im)^(\s*)create (unique )?index (?!if not exists)',r'\1create \2index if not exists ',s)
    s=re.sub(r'(?im)^(\s*)create sequence (?!if not exists)',r'\1create sequence if not exists ',s)
    def pol(m):
        return f'drop policy if exists {m.group(2)} on {m.group(3)};\n{m.group(0)}'
    s=re.sub(r'(?im)^(\s*)create policy ("[^"]+") on ([\w.]+)',pol,s)
    def trg(m):
        name, table = m.group(2), m.group(3)
        prev=s[:m.start()].rstrip().splitlines()[-1] if s[:m.start()].strip() else ""
        if prev.lower().startswith(f"drop trigger if exists {name.lower()}"): return m.group(0)
        return f'drop trigger if exists {name} on {table};\n{m.group(0)}'
    s=re.sub(r'(?ims)^()create trigger (\w+)\b.*?\bon ([\w.]+)',trg,s)
    s=s.replace("""    execute format(
      'create trigger set_updated_at""","""    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at""")
    s=s.replace("""    if t <> 'webhook_events' then
      execute format(
        'create policy""","""    if t <> 'webhook_events' then
      execute format('drop policy if exists "Admins have full access" on public.%I', t);
      execute format(
        'create policy""")
    out.append(f"\n-- ---------------------------------------------------------------------------\n-- {os.path.basename(f)}\n-- ---------------------------------------------------------------------------\n\n{s.rstrip()}\n")
open("ALL-IN-ONE.sql","w").write("".join(out))
