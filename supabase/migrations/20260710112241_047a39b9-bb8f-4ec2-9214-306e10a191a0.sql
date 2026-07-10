-- Consent logs (DPDP Act, 2023 aligned)
CREATE TABLE public.consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text,
  flight_id text,
  consent_version text NOT NULL,
  privacy_version text NOT NULL,
  browser_language text,
  device_type text,
  session_id text,
  user_agent text,
  hashed_ip text,
  source text NOT NULL DEFAULT 'web',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.consent_logs TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.consent_logs TO authenticated;
GRANT ALL ON public.consent_logs TO service_role;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert their own consent"
  ON public.consent_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all consent logs"
  ON public.consent_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete consent logs"
  ON public.consent_logs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Deletion / data-subject requests
CREATE TABLE public.deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text,
  contact text NOT NULL,
  request_type text NOT NULL DEFAULT 'delete', -- delete | access | correction | withdrawal
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
GRANT INSERT ON public.deletion_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.deletion_requests TO authenticated;
GRANT ALL ON public.deletion_requests TO service_role;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a request"
  ON public.deletion_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins manage requests"
  ON public.deletion_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update requests"
  ON public.deletion_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER deletion_requests_set_updated_at
  BEFORE UPDATE ON public.deletion_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Privacy notice versions (CMS-editable)
CREATE TABLE public.privacy_notice_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.privacy_notice_versions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.privacy_notice_versions TO authenticated;
GRANT ALL ON public.privacy_notice_versions TO service_role;
ALTER TABLE public.privacy_notice_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active privacy notice"
  ON public.privacy_notice_versions FOR SELECT
  TO anon, authenticated
  USING (active = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can write privacy notice"
  ON public.privacy_notice_versions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER privacy_notice_set_updated_at
  BEFORE UPDATE ON public.privacy_notice_versions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed initial notice
INSERT INTO public.privacy_notice_versions (version, active, sections)
VALUES ('1.0.0', true, '[
  {"title":"About this tasting","body":"Sula Vineyards offers this experience to personalise your in-venue wine tasting."},
  {"title":"Information we collect","body":"Your name, chosen wine flight, tasting choices, and — with consent — contact details for future invitations."},
  {"title":"Purpose","body":"To guide the tasting, remember your session, and — if you opt in — invite you to tastings and events."},
  {"title":"Storage","body":"Session data lives in your browser. Contact details are stored securely on Sula-managed infrastructure."},
  {"title":"Retention","body":"Retained only while relevant to Sula Vineyards; removed on request."},
  {"title":"Your rights","body":"Access, correction, withdrawal, and deletion available on request."},
  {"title":"Contact","body":"privacy@sulavineyards.com"},
  {"title":"Future integrations","body":"Consent choices will carry across future CRM and hospitality systems."}
]'::jsonb);
