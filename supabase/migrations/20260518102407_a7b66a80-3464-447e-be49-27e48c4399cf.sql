-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Site-wide settings (single row)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  hero_eyebrow text,
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  hero_cta_label text,
  hero_cta_url text,
  meta_title text,
  meta_description text,
  og_image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings public read"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "site_settings admin write"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Editorial homepage sections
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL DEFAULT 'featured',
  title text,
  subtitle text,
  image_url text,
  cta_label text,
  cta_url text,
  item_slugs text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "homepage_sections public read enabled"
  ON public.homepage_sections FOR SELECT
  USING (enabled = true);

CREATE POLICY "homepage_sections admin read all"
  ON public.homepage_sections FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "homepage_sections admin write"
  ON public.homepage_sections FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_site_settings_updated
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_homepage_sections_updated
  BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (singleton, hero_eyebrow, hero_title, hero_subtitle)
VALUES (
  true,
  'Sula — Editorial Library',
  'Brochures, films & editorial collections.',
  'A quiet shelf of our work — read at leisure, share freely.'
)
ON CONFLICT (singleton) DO NOTHING;