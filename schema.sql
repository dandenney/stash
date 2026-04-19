create table links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text not null,
  description text,
  notes text,
  tags text[] default '{}',
  type text not null default 'read' check (type in ('read', 'watched')),
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);

create index links_created_at_idx on links (created_at desc);
create index links_user_id_idx on links (user_id);
create index links_type_idx on links (type);
create index links_tags_idx on links using gin (tags);

create table api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  label text not null default 'default',
  created_at timestamptz not null default now()
);

create index api_tokens_token_idx on api_tokens (token);
