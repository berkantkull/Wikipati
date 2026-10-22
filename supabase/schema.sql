-- Run in Supabase SQL Editor once. Never expose a service_role key in the app.
create table if not exists public.wikipati_backups (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 device_label text not null check (char_length(device_label) <= 30),
 payload jsonb not null check (octet_length(payload::text) <= 10000000)
);
alter table public.wikipati_backups enable row level security;
revoke all on public.wikipati_backups from anon;
revoke all on public.wikipati_backups from authenticated;
grant select, insert on public.wikipati_backups to authenticated;
create policy "read own backups" on public.wikipati_backups for select to authenticated using ((select auth.uid()) = user_id);
create policy "create own backups" on public.wikipati_backups for insert to authenticated with check ((select auth.uid()) = user_id);
create index if not exists wikipati_backups_user_date on public.wikipati_backups(user_id,created_at desc);
