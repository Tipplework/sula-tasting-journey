
-- ============ ENUMS ============
create type public.app_role as enum ('admin');
create type public.content_type as enum ('pdf', 'video', 'gallery');
create type public.asset_type as enum ('page_image', 'gallery_image', 'thumbnail', 'download');

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'admin',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create policy "Admins can view roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
on public.user_roles for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- ============ CONTENT ITEMS ============
create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content_type content_type not null,
  category text,
  description text,
  cover_image_url text,
  primary_file_url text,
  video_url text,
  video_provider text,
  cta_label text,
  cta_url text,
  seo_title text,
  seo_description text,
  og_image_url text,
  published boolean not null default false,
  featured boolean not null default false,
  sort_order int not null default 0,
  page_count int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.content_items (published, sort_order);
create index on public.content_items (slug);
alter table public.content_items enable row level security;

create policy "Public can read published items"
on public.content_items for select
using (published = true);

create policy "Admins can read all items"
on public.content_items for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert items"
on public.content_items for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update items"
on public.content_items for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete items"
on public.content_items for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger content_items_set_updated_at
before update on public.content_items
for each row execute function public.tg_set_updated_at();

-- ============ CONTENT ASSETS ============
create table public.content_assets (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  asset_type asset_type not null,
  file_url text not null,
  thumbnail_url text,
  caption text,
  alt_text text,
  sort_order int not null default 0,
  width int,
  height int,
  created_at timestamptz not null default now()
);
create index on public.content_assets (content_item_id, sort_order);
alter table public.content_assets enable row level security;

create policy "Public can read assets of published items"
on public.content_assets for select
using (
  exists (
    select 1 from public.content_items ci
    where ci.id = content_assets.content_item_id and ci.published = true
  )
);

create policy "Admins can read all assets"
on public.content_assets for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage assets"
on public.content_assets for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- ============ CONTENT ANALYTICS ============
create table public.content_analytics (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete cascade,
  event_type text not null,
  page_slug text,
  page_index int,
  session_id text,
  user_agent text,
  referrer text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index on public.content_analytics (content_item_id, created_at desc);
alter table public.content_analytics enable row level security;

create policy "Anyone can insert analytics"
on public.content_analytics for insert
with check (true);

create policy "Admins can read analytics"
on public.content_analytics for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public) values
  ('content-pdfs', 'content-pdfs', true),
  ('content-videos', 'content-videos', true),
  ('content-images', 'content-images', true),
  ('content-thumbnails', 'content-thumbnails', true),
  ('content-og-images', 'content-og-images', true)
on conflict (id) do nothing;

-- Public read for all content buckets
create policy "Public read content buckets"
on storage.objects for select
using (bucket_id in ('content-pdfs','content-videos','content-images','content-thumbnails','content-og-images'));

create policy "Admins write content buckets"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('content-pdfs','content-videos','content-images','content-thumbnails','content-og-images')
  and public.has_role(auth.uid(), 'admin')
);

create policy "Admins update content buckets"
on storage.objects for update to authenticated
using (
  bucket_id in ('content-pdfs','content-videos','content-images','content-thumbnails','content-og-images')
  and public.has_role(auth.uid(), 'admin')
);

create policy "Admins delete content buckets"
on storage.objects for delete to authenticated
using (
  bucket_id in ('content-pdfs','content-videos','content-images','content-thumbnails','content-og-images')
  and public.has_role(auth.uid(), 'admin')
);
