create table highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text not null,
  text text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table highlights enable row level security;

create policy "Users can manage own highlights"
  on highlights for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index highlights_user_created on highlights(user_id, created_at desc);
