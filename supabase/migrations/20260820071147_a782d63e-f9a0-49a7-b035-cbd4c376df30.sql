ALTER TABLE public.menu_guest_registrations ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.menu_guest_registrations ALTER COLUMN mobile DROP NOT NULL;
ALTER TABLE public.menu_guest_registrations ADD CONSTRAINT menu_guest_registrations_contact_check CHECK (mobile IS NOT NULL OR email IS NOT NULL);