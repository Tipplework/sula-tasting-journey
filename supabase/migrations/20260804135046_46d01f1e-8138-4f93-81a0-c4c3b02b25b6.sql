-- ============ ENUM ============
CREATE TYPE public.menu_dietary_tag AS ENUM (
  'vegetarian','non_vegetarian','seafood','gluten_free','contains_dairy','vegan','contains_nuts'
);

-- ============ VENUES ============
CREATE TABLE public.menu_venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_venues TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_venues TO authenticated;
GRANT ALL ON public.menu_venues TO service_role;
ALTER TABLE public.menu_venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu_venues public read active" ON public.menu_venues
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "menu_venues admin all" ON public.menu_venues
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ CATEGORIES ============
CREATE TABLE public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.menu_venues(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  heading_style text NOT NULL DEFAULT 'default',
  publish_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (venue_id, slug)
);
CREATE INDEX menu_categories_venue_order_idx ON public.menu_categories (venue_id, display_order);
GRANT SELECT ON public.menu_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_categories TO authenticated;
GRANT ALL ON public.menu_categories TO service_role;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu_categories public read active" ON public.menu_categories
  FOR SELECT TO anon, authenticated
  USING (active = true AND (publish_at IS NULL OR publish_at <= now()));
CREATE POLICY "menu_categories admin all" ON public.menu_categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ ITEMS ============
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  calories numeric,
  standard_price numeric,
  bottle_price numeric,
  smaller_bottle_price numeric,
  glass_price numeric,
  pairing_text text,
  active boolean NOT NULL DEFAULT true,
  unavailable boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  publish_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX menu_items_category_order_idx ON public.menu_items (category_id, display_order);
GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu_items public read active" ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (active = true AND (publish_at IS NULL OR publish_at <= now()));
CREATE POLICY "menu_items admin all" ON public.menu_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ DIETARY TAGS ============
CREATE TABLE public.menu_item_dietary_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  tag public.menu_dietary_tag NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (menu_item_id, tag)
);
CREATE INDEX menu_item_dietary_tags_item_idx ON public.menu_item_dietary_tags (menu_item_id);
GRANT SELECT ON public.menu_item_dietary_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_item_dietary_tags TO authenticated;
GRANT ALL ON public.menu_item_dietary_tags TO service_role;
ALTER TABLE public.menu_item_dietary_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu_tags public read" ON public.menu_item_dietary_tags
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.menu_items i
    WHERE i.id = menu_item_id AND i.active = true
      AND (i.publish_at IS NULL OR i.publish_at <= now())
  ));
CREATE POLICY "menu_tags admin all" ON public.menu_item_dietary_tags
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ GUEST REGISTRATIONS ============
CREATE TABLE public.menu_guest_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  mobile text NOT NULL,
  birth_day smallint,
  birth_month smallint,
  marketing_consent boolean NOT NULL DEFAULT false,
  venue_slug text NOT NULL DEFAULT 'tasting-room',
  source text NOT NULL DEFAULT 'qr_digital_menu',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX menu_guest_registrations_created_idx ON public.menu_guest_registrations (created_at DESC);
CREATE INDEX menu_guest_registrations_mobile_idx ON public.menu_guest_registrations (mobile);
GRANT INSERT ON public.menu_guest_registrations TO anon;
GRANT SELECT, INSERT ON public.menu_guest_registrations TO authenticated;
GRANT ALL ON public.menu_guest_registrations TO service_role;
ALTER TABLE public.menu_guest_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu_guest_reg public insert" ON public.menu_guest_registrations
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(full_name)) BETWEEN 2 AND 80
    AND mobile ~ '^\+91[6-9][0-9]{9}$'
    AND (birth_day IS NULL OR birth_day BETWEEN 1 AND 31)
    AND (birth_month IS NULL OR birth_month BETWEEN 1 AND 12)
    AND length(coalesce(venue_slug,'')) BETWEEN 1 AND 60
    AND length(coalesce(source,'')) BETWEEN 1 AND 60
  );
CREATE POLICY "menu_guest_reg admin read" ON public.menu_guest_registrations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ CHANGE LOG ============
CREATE TABLE public.menu_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL,
  previous_data jsonb,
  new_data jsonb,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX menu_change_log_created_idx ON public.menu_change_log (created_at DESC);
GRANT SELECT ON public.menu_change_log TO authenticated;
GRANT ALL ON public.menu_change_log TO service_role;
ALTER TABLE public.menu_change_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu_change_log admin read" ON public.menu_change_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ TRIGGERS ============
CREATE TRIGGER menu_venues_set_updated_at BEFORE UPDATE ON public.menu_venues
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER menu_categories_set_updated_at BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER menu_items_set_updated_at BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE FUNCTION public.tg_menu_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rid uuid;
BEGIN
  rid := CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END;
  INSERT INTO public.menu_change_log (table_name, record_id, action, previous_data, new_data, changed_by)
  VALUES (
    TG_TABLE_NAME,
    rid,
    lower(TG_OP),
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE TRIGGER menu_categories_audit AFTER INSERT OR UPDATE OR DELETE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION public.tg_menu_audit();
CREATE TRIGGER menu_items_audit AFTER INSERT OR UPDATE OR DELETE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_menu_audit();
CREATE TRIGGER menu_item_dietary_tags_audit AFTER INSERT OR UPDATE OR DELETE ON public.menu_item_dietary_tags
  FOR EACH ROW EXECUTE FUNCTION public.tg_menu_audit();