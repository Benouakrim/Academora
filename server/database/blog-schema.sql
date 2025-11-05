-- Blog system schema (categories, tags, articles, relations)
-- Run in Supabase SQL editor

create extension if not exists "uuid-ossp";

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  slug text unique not null
);

create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  slug text unique not null
);

create table if not exists articles (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid,
  title text not null,
  slug text unique not null,
  excerpt text,
  content jsonb not null,
  meta_title text,
  meta_description text,
  og_image text,
  canonical_url text,
  status text check (status in ('draft','review','published')) default 'draft',
  category_id uuid references categories(id),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists article_tags (
  article_id uuid references articles(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- Trigger to keep updated_at fresh
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_articles_updated on articles;
create trigger trg_articles_updated
before update on articles
for each row execute procedure set_updated_at();

-- Indexes
create index if not exists idx_articles_slug on articles(slug);
create index if not exists idx_articles_status on articles(status);
create index if not exists idx_articles_search on articles using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,'')));


