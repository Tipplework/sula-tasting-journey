
-- =========================================================
-- WINES
-- =========================================================
CREATE TABLE public.wines (
  id integer PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  journey_tag text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  tasting_notes text NOT NULL DEFAULT '',
  food_pairing jsonb NOT NULL DEFAULT '[]'::jsonb,
  vivino text NOT NULL DEFAULT '',
  usp text NOT NULL DEFAULT '',
  personality text NOT NULL DEFAULT '',
  personality_label text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  question text NOT NULL DEFAULT '',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  sommelier_note text NOT NULL DEFAULT '',
  tasting_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_pour text NOT NULL DEFAULT '',
  next_pour_reason text NOT NULL DEFAULT '',
  notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  awards jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.wines TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wines TO authenticated;
GRANT ALL ON public.wines TO service_role;

ALTER TABLE public.wines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active wines"
  ON public.wines FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can read all wines"
  ON public.wines FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert wines"
  ON public.wines FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update wines"
  ON public.wines FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete wines"
  ON public.wines FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER wines_set_updated_at
  BEFORE UPDATE ON public.wines
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- FLIGHTS
-- =========================================================
CREATE TABLE public.flights (
  id text PRIMARY KEY,          -- 'A' | 'B' | 'C' | 'D' (or future)
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  glyph text NOT NULL DEFAULT 'whites',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.flights TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flights TO authenticated;
GRANT ALL ON public.flights TO service_role;

ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active flights"
  ON public.flights FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can read all flights"
  ON public.flights FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert flights"
  ON public.flights FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update flights"
  ON public.flights FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete flights"
  ON public.flights FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER flights_set_updated_at
  BEFORE UPDATE ON public.flights
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- FLIGHT ↔ WINE JOIN
-- =========================================================
CREATE TABLE public.flight_wines (
  flight_id text NOT NULL REFERENCES public.flights(id) ON DELETE CASCADE,
  wine_id integer NOT NULL REFERENCES public.wines(id) ON DELETE CASCADE,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (flight_id, position)
);

CREATE INDEX flight_wines_wine_idx ON public.flight_wines(wine_id);

GRANT SELECT ON public.flight_wines TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flight_wines TO authenticated;
GRANT ALL ON public.flight_wines TO service_role;

ALTER TABLE public.flight_wines ENABLE ROW LEVEL SECURITY;

-- Public can see mappings for active flights only
CREATE POLICY "Public can read active flight wines"
  ON public.flight_wines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.flights f
      WHERE f.id = flight_wines.flight_id AND f.active = true
    )
  );

CREATE POLICY "Admins can read all flight wines"
  ON public.flight_wines FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert flight wines"
  ON public.flight_wines FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update flight wines"
  ON public.flight_wines FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete flight wines"
  ON public.flight_wines FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =========================================================
-- SEED — 14 wines
-- =========================================================
INSERT INTO public.wines (id, slug, name, subtitle, journey_tag, description, tasting_notes, food_pairing, vivino, usp, personality, personality_label, image, question, options, sommelier_note, tasting_steps, next_pour, next_pour_reason, notes, awards, active, sort_order) VALUES
(1,'the-source-chenin-blanc-reserve','The Source Chenin Blanc Reserve','Reserve White','Crisp',
 'Indulge in The Source Chenin Blanc Reserve, the only Indian wine to win Silver at the Concours Mondial de Bruxelles. Crisp, vibrant, with notes of ripe pear and honey.',
 'Ripe pear, orange blossom and gentle honey on a crisp, luminous finish.',
 '["Butter Garlic Prawns","Goat Cheese Salad","Kanda Bhaji"]'::jsonb,
 'https://www.vivino.com/search/wines?q=the+source+chenin+blanc+reserve',
 'The only Indian wine to earn Silver at Concours Mondial de Bruxelles.',
 'Crisp & luminous, an elegant reserve for refined palates.','Refined','',
 'What did you feel?','["Pear","Honey","Crisp"]'::jsonb,
 'Bright and honeyed, sip slowly and let the reserve depth open.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'The Source Sauvignon Blanc',
 'If this refined line moved you, we''d take you into zesty Sauvignon Blanc.',
 '["Pear","Honey","Crisp"]'::jsonb,
 '[{"medal":"Silver","competition":"Concours Mondial de Bruxelles"}]'::jsonb,
 true,1),
(2,'the-source-sauvignon-blanc','The Source Sauvignon Blanc','Estate White','Zesty',
 'Experience the vibrant The Source Sauvignon Blanc, recognised as Best in Show at the India Wine Awards and Best Indian White Wine. Crisp, zesty with tropical fruit notes.',
 'Passionfruit, guava and citrus zest with a lively, mineral finish.',
 '["Fish Fingers","Grilled Asparagus","Ceviche"]'::jsonb,
 'https://www.vivino.com/search/wines?q=the+source+sauvignon+blanc',
 'Best in Show — India Wine Awards; Best Indian White Wine.',
 'Fresh, tropical and effortlessly bright.','Cheerful','',
 'Which note stood out?','["Tropical","Zesty","Fresh"]'::jsonb,
 'Zesty and tropical, a wine that wakes up the senses.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'Dindori Reserve Chardonnay',
 'For more depth, we''d guide you next to our oak-aged Chardonnay.',
 '["Tropical","Zesty","Fresh"]'::jsonb,
 '[{"medal":"Best in Show","competition":"India Wine Awards"}]'::jsonb,
 true,2),
(3,'dindori-reserve-chardonnay','Dindori Reserve Chardonnay','Oak-aged Chardonnay','Elegant',
 'India''s first Gold winner at the Paris Wine Cup. A rich creamy palate with vanilla and tropical fruit.',
 'Silky vanilla, ripe pineapple and toasted oak in a long, layered finish.',
 '["Butter Garlic Prawns","Tandoori Chicken","Veggie Delight"]'::jsonb,
 'https://www.vivino.com/US/en/sula-vineyards-dindori-reserve-chardonnay/w/6760667',
 'India''s first Gold winner at Paris Wine Cup.',
 'Complex and indulgent — a wine for refined palates.','Refined','',
 'How does it feel on your palate?','["Sophisticated","Warm & cozy","Curious"]'::jsonb,
 'Now we slow down — oak, lemon and silk. Sip gently, let it bloom.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'Late Harvest Chenin Blanc',
 'If this elegance moved you, we''d finish with our honeyed Late Harvest Chenin.',
 '["Vanilla","Tropical fruit","Creamy"]'::jsonb,
 '[{"medal":"Gold","competition":"Paris Wine Cup"}]'::jsonb,
 true,3),
(4,'late-harvest-chenin-blanc','Late Harvest Chenin Blanc','Dessert White','Indulgent',
 'The first Indian wine to win Silver at Paris Wine Cup and Decanter. Sweet honey flavours with luscious balance.',
 'Golden honey, dried apricot and candied citrus in a silky, gently sweet finish.',
 '["Blue Cheese","Fruit Tart","Spicy Thai"]'::jsonb,
 'https://www.vivino.com/search/wines?q=sula+late+harvest+chenin+blanc',
 'First Indian wine to win Silver at Paris Wine Cup and Decanter.',
 'Rich, honeyed and indulgent — dessert in a glass.','Playful','',
 'Which note shines through?','["Honey","Apricot","Citrus"]'::jsonb,
 'A sweet close — honey, apricot and gentle richness.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'Tropicale Rosé',
 'If this delighted you, we''d take you toward our sparkling Tropicale Rosé.',
 '["Honey","Apricot","Sweet"]'::jsonb,
 '[{"medal":"Silver","competition":"Paris Wine Cup"},{"medal":"Silver","competition":"Decanter"}]'::jsonb,
 true,4),
(5,'dindori-reserve-shiraz','Dindori Reserve Shiraz','Oak-aged Shiraz','Bold',
 'India''s most loved wine — a plush, spice-driven Shiraz with a Silver at Paris Wine Cup.',
 'Blackberry, cracked pepper and a lift of vanilla oak in a warm, layered finish.',
 '["Tandoori Chicken","Grilled Lamb","Aged Cheese"]'::jsonb,
 'https://www.vivino.com/search/wines?q=dindori+reserve+shiraz',
 'India''s most loved wine — Silver at Paris Wine Cup.',
 'Plush, peppery, quietly powerful.','Bold Explorer','',
 'What stood out?','["Pepper","Dark fruit","Warmth"]'::jsonb,
 'Warm, peppery and generous — take your time with this one.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'Rasa Zinfandel',
 'For a bolder step, we''d move you into our Rasa Zinfandel.',
 '["Black pepper","Dark berry","Spice"]'::jsonb,
 '[{"medal":"Silver","competition":"Paris Wine Cup"}]'::jsonb,
 true,5),
(6,'rasa-zinfandel','Rasa Zinfandel','Premium Zinfandel','Rich',
 'A supple, jammy Zinfandel with Silver at the India Wine Awards.',
 'Ripe raspberry, black cherry and clove in a smooth, opulent finish.',
 '["Wine Glazed Wings","BBQ","Mushroom Risotto"]'::jsonb,
 'https://www.vivino.com/search/wines?q=rasa+zinfandel',
 'Silver at India Wine Awards.',
 'Ripe, generous and quietly indulgent.','Romantic','',
 'What did you notice?','["Berry","Spice","Smooth"]'::jsonb,
 'Jammy and gentle — a wine that feels like a warm evening.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'Rasa Syrah',
 'If this softness charmed you, we''d move into deeper Rasa Syrah next.',
 '["Ripe berry","Sweet spice","Smooth"]'::jsonb,
 '[{"medal":"Silver","competition":"India Wine Awards"}]'::jsonb,
 true,6),
(7,'rasa-syrah','Rasa Syrah','Premium Syrah','Bold',
 'A delicious Syrah, rich and opulent, with a touch of Viognier for more suppleness. Gold at Paris Wine Cup and Silver at Syrah du Monde.',
 'Cassis, black pepper and violet with a supple, long finish — polished and full of character.',
 '["Tandoori Chicken","Wine Glazed Wings","Cheese Platter"]'::jsonb,
 'https://www.vivino.com/US/en/sula-vineyards-rasa-syrah-nashik-red-wine/w/1176482',
 'Ranked #1 among Indian reds; Gold at Paris Wine Cup.',
 'Powerful, indulgent and unforgettable.','Bold Explorer','',
 'What stood out?','["Deep spice","Dark fruit","Smooth finish"]'::jsonb,
 'Our boldest pour. Swirl gently, breathe it in, then sip slowly.',
 '["Swirl the glass gently","Take a generous sip","Notice the spice and long finish"]'::jsonb,
 'Rasa Cabernet Sauvignon',
 'If this spoke to you, we''d take you deeper with Rasa Cabernet Sauvignon.',
 '["Deep spice","Dark fruit","Smooth"]'::jsonb,
 '[{"medal":"Gold","competition":"Paris Wine Cup"},{"medal":"Silver","competition":"Syrah du Monde"}]'::jsonb,
 true,7),
(8,'rasa-cabernet-sauvignon','Rasa Cabernet Sauvignon','Flagship Cabernet','Flagship',
 'Our flagship — the first Indian Gold winner at the Global Cabernet Sauvignon Masters 2024.',
 'Blackcurrant, tobacco and cedar with fine, silken tannins.',
 '["Grilled Lamb","Steak","Dark Chocolate"]'::jsonb,
 'https://www.vivino.com/search/wines?q=rasa+cabernet+sauvignon',
 'First Indian Gold winner — Global Cabernet Sauvignon Masters 2024.',
 'Refined, structured and quietly powerful.','Bold Explorer','',
 'What did you feel?','["Blackcurrant","Cedar","Silky tannin"]'::jsonb,
 'Our flagship — a slow, contemplative red. Sip and let it unfold.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'Dindori Reserve Shiraz',
 'For more spice next, we''d move back to Dindori Reserve Shiraz.',
 '["Blackcurrant","Cedar","Structured"]'::jsonb,
 '[{"medal":"Gold","competition":"Global Cabernet Sauvignon Masters 2024"}]'::jsonb,
 true,8),
(9,'the-source-grenache-rose','The Source Grenache Rosé','Provence-style Rosé','Lively',
 'A Provence-inspired rosé with fresh strawberry, red cherry, raspberry and a whisper of soft spice.',
 'Strawberry, red cherry and raspberry with a delicate spice lift and a clean finish.',
 '["Watermelon & Feta Salad","Kanda Bhaji","Fish Fingers"]'::jsonb,
 'https://www.vivino.com/US/en/the-source-grenache-rose-nashik-rose-wine-v-3yzcq/w/5922800',
 'Provence-style rosé — India''s best rosé, sustainable winemaking.',
 'Romantic and sunlit — ideal for slow afternoons.','Romantic','',
 'What did you feel?','["Sunset rooftop","Garden brunch","Beach picnic"]'::jsonb,
 'A breath of Provence in Nashik — soft, peachy, sunlit.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'The Source Moscato',
 'If this romance charmed you, we''d end with our sparkling Moscato.',
 '["Fresh strawberry","Red cherry","Raspberry","Soft spice"]'::jsonb,
 '[]'::jsonb,
 true,9),
(10,'the-source-cabernet-sauvignon','The Source Cabernet Sauvignon','Estate Cabernet','Elegant',
 'Rich, smooth and elegant — a poised expression of Nashik Cabernet.',
 'Ripe plum, cocoa and gentle spice with a smooth, refined finish.',
 '["Grilled Steak","Mushroom Risotto","Hard Cheese"]'::jsonb,
 'https://www.vivino.com/search/wines?q=the+source+cabernet+sauvignon',
 'An estate Cabernet crafted for refined, everyday elegance.',
 'Smooth, poised and quietly elegant.','Refined','',
 'How did it feel?','["Rich","Smooth","Elegant"]'::jsonb,
 'Refined and rounded — an easy, elegant red.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'The Source Moscato',
 'For a bright finish, we''d take you to our sparkling Moscato.',
 '["Rich","Smooth","Elegant"]'::jsonb,
 '[]'::jsonb,
 true,10),
(11,'the-source-moscato','The Source Moscato','Sparkling Sweet','Indulgent',
 'Lightly sparkling with peach, apricot and lychee. Gold at Asian Sparkling Masters.',
 'Lightly sparkling with expressive notes of citrus, lychee and peach — a perfect balance of acidity and sweetness.',
 '["Cheese Platter","Kanda Bhaji","Fruit Dessert"]'::jsonb,
 'https://www.vivino.com/US/en/sula-vineyards-the-source-moscato-nashik/w/12872619',
 'India''s first Moscato — Gold at Asian Sparkling Masters.',
 'Playful, indulgent and full of vibes.','Playful','',
 'Which note shines through?','["Peach","Apricot","Lychee"]'::jsonb,
 'Gentle bubbles, fruit and balance — a joyful sip.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'Sparkling Shiraz',
 'If this delighted you, we''d move into our Sparkling Shiraz.',
 '["Peach","Apricot","Lychee"]'::jsonb,
 '[{"medal":"Gold","competition":"Asian Sparkling Masters"}]'::jsonb,
 true,11),
(12,'sula-brut','Sula Brut','Traditional Method Brut','Fresh',
 'A crisp, elegant Brut with fine bubbles — recognised at Paris Wine Cup and Decanter.',
 'Lemon zest, green apple and brioche on a crisp, mineral finish.',
 '["Oysters","Sushi","Salted Nuts"]'::jsonb,
 'https://www.vivino.com/search/wines?q=sula+brut',
 'India''s benchmark traditional-method sparkling.',
 'Crisp, bright and celebratory.','Cheerful','',
 'What did you feel?','["Citrus","Green apple","Brioche"]'::jsonb,
 'Bright and mineral — a classic start to a celebration.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'Tropicale Rosé',
 'If this brightness charmed you, we''d move into Tropicale Rosé.',
 '["Citrus","Green Apple","Fine bubbles"]'::jsonb,
 '[{"medal":"Silver","competition":"Paris Wine Cup"},{"medal":"Silver","competition":"Decanter"}]'::jsonb,
 true,12),
(13,'tropicale-rose','Tropicale Rosé','Sparkling Rosé','Fresh',
 'The happiest sparkling rosé — pure bliss, full of tropical notes. Gold at International Wine Challenge.',
 'The happiest sparkling rosé — pure bliss, full of tropical notes.',
 '["Kanda Bhaji","French Fries","Mezze Platter"]'::jsonb,
 'https://www.vivino.com/US/en/sula-vineyards-brut-tropicale/w/4488268',
 'India''s favourite sparkling — Gold at International Wine Challenge.',
 'Cheerful & vibrant — perfect for celebrations.','Cheerful','',
 'What did you feel?','["Tropical fruit","Berries","Citrus zest"]'::jsonb,
 'Light and joyful — a sparkling rosé to wake up your palate.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'Sparkling Shiraz',
 'If this celebration continued, we''d move you into Sparkling Shiraz.',
 '["Tropical fruit","Berries","Citrus zest"]'::jsonb,
 '[{"medal":"Gold","competition":"International Wine Challenge"}]'::jsonb,
 true,13),
(14,'sparkling-shiraz','Sparkling Shiraz','Sparkling Red','Bold',
 'A bold, celebratory sparkling red — Gold at India Wine Awards. Rare, playful and unforgettable.',
 'Blackberry, plum and warm spice with a lift of fine bubbles.',
 '["BBQ","Charcuterie","Dark Chocolate"]'::jsonb,
 'https://www.vivino.com/search/wines?q=sula+sparkling+shiraz',
 'Gold at India Wine Awards — a rare Indian sparkling red.',
 'Playful, celebratory and delightfully bold.','Playful','',
 'What did you notice?','["Dark berry","Spice","Bubbles"]'::jsonb,
 'A sparkling red — celebratory, unusual, unforgettable.',
 '["Swirl gently in the glass","Breathe in the aromas","Take a slow, thoughtful sip"]'::jsonb,
 'The Source Moscato',
 'To finish on a sweet, gentle note, we''d move into The Source Moscato.',
 '["Dark berry","Spice","Fine bubbles"]'::jsonb,
 '[{"medal":"Gold","competition":"India Wine Awards"}]'::jsonb,
 true,14);

-- =========================================================
-- SEED — 4 flights
-- =========================================================
INSERT INTO public.flights (id, code, name, subtitle, description, glyph, active, sort_order) VALUES
('A','crisp-classic','Crisp & Classic','Whites','Bright, refreshing and elegantly expressive.','whites',true,1),
('B','bold-beautiful','Bold & Beautiful','Reds','Rich, layered and full of character.','reds',true,2),
('C','sula-signature','Sula Signature','Best of Sula','A curated collection of Sula favourites.','signature',true,3),
('D','bubbles-bliss','Bubbles & Bliss','Sparkling','Lively, celebratory and beautifully refreshing.','sparkling',true,4);

-- =========================================================
-- SEED — flight ↔ wine ordering
-- =========================================================
INSERT INTO public.flight_wines (flight_id, wine_id, position) VALUES
('A',1,1),('A',2,2),('A',3,3),('A',4,4),
('B',5,1),('B',6,2),('B',7,3),('B',8,4),
('C',3,1),('C',9,2),('C',10,3),('C',11,4),
('D',12,1),('D',13,2),('D',14,3),('D',11,4);
