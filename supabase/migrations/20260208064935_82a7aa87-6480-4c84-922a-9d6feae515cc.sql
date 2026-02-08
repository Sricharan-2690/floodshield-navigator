-- 1) Core helper for updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Profiles
create table if not exists public.profiles (
  user_id uuid primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
on public.profiles
for select
using (true);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id);

-- 3) Danger alerts
create table if not exists public.danger_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  location_text text not null,
  lat double precision not null,
  lng double precision not null,
  message text not null,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '36 hours')
);

create index if not exists idx_danger_alerts_expires_at on public.danger_alerts (expires_at);
create index if not exists idx_danger_alerts_created_at on public.danger_alerts (created_at desc);
create index if not exists idx_danger_alerts_lat_lng on public.danger_alerts (lat, lng);

create trigger trg_danger_alerts_updated_at
before update on public.danger_alerts
for each row execute function public.update_updated_at_column();

alter table public.danger_alerts enable row level security;

create policy "Danger alerts are publicly readable (non-expired)"
on public.danger_alerts
for select
using (expires_at > now());

create policy "Authenticated users can create alerts for themselves"
on public.danger_alerts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Owners can update their alerts"
on public.danger_alerts
for update
to authenticated
using (auth.uid() = user_id);

create policy "Owners can delete their alerts"
on public.danger_alerts
for delete
to authenticated
using (auth.uid() = user_id);

-- 4) Comments
create table if not exists public.danger_alert_comments (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.danger_alerts(id) on delete cascade,
  user_id uuid not null,
  comment text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_danger_alert_comments_alert_id_created_at
on public.danger_alert_comments (alert_id, created_at desc);

alter table public.danger_alert_comments enable row level security;

create policy "Comments are publicly readable"
on public.danger_alert_comments
for select
using (true);

create policy "Authenticated users can comment as themselves"
on public.danger_alert_comments
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
on public.danger_alert_comments
for delete
to authenticated
using (auth.uid() = user_id);

-- 5) Votes (one per user per alert)
create table if not exists public.danger_alert_votes (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.danger_alerts(id) on delete cascade,
  user_id uuid not null,
  vote smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (alert_id, user_id),
  constraint danger_alert_votes_vote_chk check (vote in (-1, 1))
);

create index if not exists idx_danger_alert_votes_alert_id on public.danger_alert_votes (alert_id);

create trigger trg_danger_alert_votes_updated_at
before update on public.danger_alert_votes
for each row execute function public.update_updated_at_column();

alter table public.danger_alert_votes enable row level security;

create policy "Votes are publicly readable"
on public.danger_alert_votes
for select
using (true);

create policy "Authenticated users can vote as themselves"
on public.danger_alert_votes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own vote"
on public.danger_alert_votes
for update
to authenticated
using (auth.uid() = user_id);

create policy "Users can delete their own vote"
on public.danger_alert_votes
for delete
to authenticated
using (auth.uid() = user_id);

-- 6) Storage bucket for optional alert photos
insert into storage.buckets (id, name, public)
values ('danger-alert-photos', 'danger-alert-photos', true)
on conflict (id) do nothing;

-- Allow public read of objects in this bucket
create policy "Public can read danger alert photos"
on storage.objects
for select
using (bucket_id = 'danger-alert-photos');

-- Allow authenticated users to upload into folder named by their user_id
create policy "Users can upload their own danger alert photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'danger-alert-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own danger alert photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'danger-alert-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own danger alert photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'danger-alert-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- 7) Scheduled cleanup (best-effort): delete expired alerts every 30 minutes
-- Note: pg_cron availability depends on the Supabase project settings.
create extension if not exists pg_cron;

select
  cron.schedule(
    'delete-expired-danger-alerts',
    '*/30 * * * *',
    $$
      delete from public.danger_alerts
      where expires_at < now();
    $$
  )
where not exists (
  select 1 from cron.job where jobname = 'delete-expired-danger-alerts'
);
