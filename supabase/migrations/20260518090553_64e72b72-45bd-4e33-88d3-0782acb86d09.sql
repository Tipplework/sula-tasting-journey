
-- Fix function search_path on tg_set_updated_at
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Tighten analytics insert: must reference an existing published item (or null)
drop policy if exists "Anyone can insert analytics" on public.content_analytics;
create policy "Anyone can insert analytics for published items"
on public.content_analytics for insert
with check (
  content_item_id is null
  or exists (
    select 1 from public.content_items ci
    where ci.id = content_item_id and ci.published = true
  )
);
