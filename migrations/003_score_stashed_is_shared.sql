-- Convert status values to domain language
alter table links drop constraint if exists links_status_check;
update links set status = 'score' where status = 'pending';
update links set status = 'stashed' where status in ('read', 'watched');
alter table links add constraint links_status_check check (status in ('score', 'stashed'));
alter table links alter column status set default 'score';

-- Replace is_private with is_shared (inverted: explicit sharing, nothing public by default)
alter table links add column is_shared boolean not null default false;
alter table links add column shared_at timestamptz;
alter table links drop column is_private;
