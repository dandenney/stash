create table user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  layout_inverted boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table user_preferences enable row level security;

create policy "Users can manage own preferences"
  on user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
