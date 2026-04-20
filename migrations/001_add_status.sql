-- Rename type to media_type
alter table links rename column type to media_type;
alter table links drop constraint links_type_check;
alter table links add constraint links_media_type_check check (media_type in ('article', 'video'));

-- Update existing values to match new naming
update links set media_type = 'article' where media_type = 'read';
update links set media_type = 'video' where media_type = 'watched';

-- Add status column
alter table links add column status text not null default 'pending'
  check (status in ('pending', 'read', 'watched'));
