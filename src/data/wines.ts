// Sula Tasting Journey — Wine Catalogue & Flights
// 14 unique wines; 16 flight slots (2 shared: Dindori Chardonnay, The Source Moscato)
// Bottle images served from Supabase Storage (absolute URLs work on any domain).

const BOTTLE_CDN =
  "https://iotmypnapdhruaeecghw.supabase.co/storage/v1/object/public/content-images/bottles";

const cheninBlancImg = { url: `${BOTTLE_CDN}/The_Source_Chenin_Blanc_2023.png` };
const sauvBlancImg = { url: `${BOTTLE_CDN}/The_Source_Sauvignon_Blanc_2023.png` };
const dindoriChardImg = { url: `${BOTTLE_CDN}/Dindori_Chardonnay_2023.png` };
const lhCheninImg = { url: `${BOTTLE_CDN}/Sula_late_harvest_2023.png` };
const dindoriShirazImg = { url: `${BOTTLE_CDN}/Dindori_Shiraz_2022.png` };
const rasaZinImg = { url: `${BOTTLE_CDN}/Rasa_Zinfandel_2022.png` };
const rasaSyrahImg = { url: `${BOTTLE_CDN}/Rasa_Syrah_2022.png` };
const rasaCabImg = { url: `${BOTTLE_CDN}/Rasa_Cabernet_Sauvignon_2021.png` };
const grenacheRoseImg = { url: `${BOTTLE_CDN}/The_Source_Grenache_Rose_2023.png` };
const sourceMoscatoImg = { url: `${BOTTLE_CDN}/The_Source_Moscato.png` };
const sourceCabImg = { url: `${BOTTLE_CDN}/The_Source_Cabernet_Sauvignon_2022.png` };
const sparklingShirazImg = { url: `${BOTTLE_CDN}/Sula_Sparkling_Shiraz.png` };
const sulaBrutImg = { url: `${BOTTLE_CDN}/Sula_Brut.png` };
const tropicaleImg = { url: `${BOTTLE_CDN}/Sula_Brut_Tropicale.png` };

export interface Award {
  medal: string;
  competition: string;
}

export interface Wine {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  journeyTag: string;
  tastingNotes: string;
  foodPairing: string[];
  pairingNote?: string;
  vivino: string;
  usp: string;
  personality: string;
  personalityLabel: string;
  image: string;
  question: string;
  options: string[];
  sommelierNote: string;
  tastingSteps: string[];
  nextPour: string;
  nextPourReason: string;
  description: string;
  awards: Award[];
  notes: string[];
  active: boolean;
}

const defaultSteps = [
  "Swirl gently in the glass",
  "Breathe in the aromas",
  "Take a slow, thoughtful sip",
];

// ────────────────────────────────────────────────────────────
// Wine Catalogue (14 unique wines)
// ────────────────────────────────────────────────────────────
export const wines: Wine[] = [
  // 1
  {
    id: 1,
    slug: "the-source-chenin-blanc-reserve",
    name: "The Source Chenin Blanc Reserve",
    subtitle: "Reserve White",
    journeyTag: "Crisp",
    description:
      "Indulge in The Source Chenin Blanc Reserve, the only Indian wine to win Silver at the Concours Mondial de Bruxelles. Crisp, vibrant, with notes of ripe pear and honey—truly one of a kind.",
    notes: ["Pear", "Honey", "Crisp"],
    awards: [{ medal: "Silver", competition: "Concours Mondial de Bruxelles" }],
    tastingNotes: "Ripe pear, orange blossom and gentle honey on a crisp, luminous finish.",
    foodPairing: ["Hummus with Pita Bread", "Butter Garlic Prawns", "Mezze Platter"],
    vivino: "https://www.vivino.com/US/en/sula-vineyards-the-source-reserve-chenin-blanc/w/10964980",
    usp: "The only Indian wine to earn Silver at Concours Mondial de Bruxelles.",
    personality: "Crisp & luminous, an elegant reserve for refined palates.",
    personalityLabel: "Refined",
    image: cheninBlancImg.url,
    question: "What did you feel?",
    options: ["Pear", "Honey", "Crisp"],
    sommelierNote: "Bright and honeyed, sip slowly and let the reserve depth open.",
    tastingSteps: defaultSteps,
    nextPour: "The Source Sauvignon Blanc",
    nextPourReason: "If this refined line moved you, we'd take you into zesty Sauvignon Blanc.",
    active: true,
  },
  // 2
  {
    id: 2,
    slug: "the-source-sauvignon-blanc-reserve",
    name: "The Source Sauvignon Blanc Reserve",
    subtitle: "Reserve White",
    journeyTag: "Zesty",
    description:
      "Experience the vibrant The Source Sauvignon Blanc Reserve, recognized as Best in Show at the India Wine Awards and Best Indian White Wine. Crisp, zesty, with tropical notes—an award-winning delight in every glass.",
    notes: ["Tropical", "Zesty", "Fresh"],
    awards: [{ medal: "Best in Show", competition: "India Wine Awards" }],
    tastingNotes: "Passionfruit, guava and citrus zest with a lively, mineral finish.",
    foodPairing: ["Skillet Tossed Vegetables", "Chili Lime Cilantro Fish Fingers", "Pesto Pineapple & Peppers Bruschetta"],
    vivino: "https://www.vivino.com/US/en/sula-vineyards-the-source-reserve-sauvignon-blanc/w/6870792",
    usp: "Best in Show — India Wine Awards; Best Indian White Wine.",
    personality: "Fresh, tropical and effortlessly bright.",
    personalityLabel: "Cheerful",
    image: sauvBlancImg.url,
    question: "Which note stood out?",
    options: ["Tropical", "Zesty", "Fresh"],
    sommelierNote: "Zesty and tropical, a wine that wakes up the senses.",
    tastingSteps: defaultSteps,
    nextPour: "Dindori Reserve Chardonnay",
    nextPourReason: "For more depth, we'd guide you next to our oak-aged Chardonnay.",
    active: true,
  },
  // 3
  {
    id: 3,
    slug: "dindori-reserve-chardonnay",
    name: "Dindori Reserve Chardonnay",
    subtitle: "Oak-aged Chardonnay",
    journeyTag: "Elegant",
    description:
      "Discover the exquisite Dindori Reserve Chardonnay, India's first Gold winner at the Paris Wine Cup. With its rich, creamy texture and notes of tropical fruit and vanilla, it's a must-try for wine lovers.",
    notes: ["Vanilla", "Tropical fruit", "Creamy"],
    awards: [{ medal: "Gold", competition: "Paris Wine Cup" }],
    tastingNotes: "Silky vanilla, ripe pineapple and toasted oak in a long, layered finish.",
    foodPairing: ["Butter Garlic Prawns", "Wild Mushroom on Toast", "Classic Margherita Pizza"],
    vivino: "https://www.vivino.com/US/en/sula-vineyards-dindori-reserve-chardonnay/w/6760667",
    usp: "India's first Gold winner at Paris Wine Cup.",
    personality: "Complex and indulgent — a wine for refined palates.",
    personalityLabel: "Refined",
    image: dindoriChardImg.url,
    question: "How does it feel on your palate?",
    options: ["Sophisticated", "Warm & cozy", "Curious"],
    sommelierNote: "Now we slow down — oak, lemon and silk. Sip gently, let it bloom.",
    tastingSteps: defaultSteps,
    nextPour: "The Source Moscato",
    nextPourReason: "If this elegance moved you, we'd finish on a sweet sparkle with our Moscato.",
    active: true,
  },
  // 4
  {
    id: 4,
    slug: "late-harvest-chenin-blanc",
    name: "Late Harvest Chenin Blanc",
    subtitle: "Dessert White",
    journeyTag: "Indulgent",
    description:
      "Bask in Sula's Late Harvest Chenin Blanc, the first Indian wine to win Silver at the Paris Wine Cup and Decanter World Wine Awards. Sweet and rich, with notes of honey, this wine is a true delight for the palate.",
    notes: ["Honey", "Apricot", "Sweet"],
    awards: [
      { medal: "Silver", competition: "Paris Wine Cup" },
      { medal: "Silver", competition: "Decanter World Wine Awards" },
    ],
    tastingNotes: "Golden honey, dried apricot and candied citrus in a silky, gently sweet finish.",
    foodPairing: [],
    pairingNote: "Ask our wine guide for today's dessert pairing recommendation.",
    vivino: "https://www.vivino.com/US/en/sula-vineyards-late-harvest-chenin-blanc/w/19868",
    usp: "First Indian wine to win Silver at Paris Wine Cup and Decanter World Wine Awards.",
    personality: "Rich, honeyed and indulgent — dessert in a glass.",
    personalityLabel: "Playful",
    image: lhCheninImg.url,
    question: "Which note shines through?",
    options: ["Honey", "Apricot", "Citrus"],
    sommelierNote: "A sweet close — honey, apricot and gentle richness.",
    tastingSteps: defaultSteps,
    nextPour: "Tropicale Rosé",
    nextPourReason: "If this delighted you, we'd take you toward our sparkling Tropicale Rosé.",
    active: true,
  },
  // 5
  {
    id: 5,
    slug: "dindori-reserve-shiraz",
    name: "Dindori Reserve Shiraz",
    subtitle: "Oak-aged Shiraz",
    journeyTag: "Bold",
    description:
      "Taste India's most loved wine, Dindori Reserve Shiraz, a Silver medal winner at the Paris Wine Cup. With its rich, bold flavours, it promises an unforgettable experience for every wine lover.",
    notes: ["Black pepper", "Dark berry", "Spice"],
    awards: [{ medal: "Silver", competition: "Paris Wine Cup" }],
    tastingNotes: "Blackberry, cracked pepper and a lift of vanilla oak in a warm, layered finish.",
    foodPairing: ["Cheezy Chicken Treat", "Murg Chatpata", "Classic Margherita Pizza"],
    vivino: "https://www.vivino.com/US/en/sula-vineyards-dindori-reserve-shiraz/w/19859",
    usp: "India's most loved wine — Silver at Paris Wine Cup.",
    personality: "Plush, peppery, quietly powerful.",
    personalityLabel: "Bold Explorer",
    image: dindoriShirazImg.url,
    question: "What stood out?",
    options: ["Pepper", "Dark fruit", "Warmth"],
    sommelierNote: "Warm, peppery and generous — take your time with this one.",
    tastingSteps: defaultSteps,
    nextPour: "Rasa Zinfandel",
    nextPourReason: "For a bolder step, we'd move you into our Rasa Zinfandel.",
    active: true,
  },
  // 6
  {
    id: 6,
    slug: "rasa-zinfandel",
    name: "Rasa Zinfandel",
    subtitle: "Premium Zinfandel",
    journeyTag: "Rich",
    description:
      "Savor Rasa Zinfandel, a Silver medal winner at the India Wine Awards. A bold yet smooth wine, aged to perfection, it promises vibrant fruit flavours, making it a memorable choice.",
    notes: ["Ripe berry", "Sweet spice", "Smooth"],
    awards: [{ medal: "Silver", competition: "India Wine Awards" }],
    tastingNotes: "Ripe raspberry, black cherry and clove in a smooth, opulent finish.",
    foodPairing: ["Scallion Chicken", "Wild Mushroom on Toast", "Classic Margherita Pizza"],
    vivino: "https://www.vivino.com/US/en/sula-vineyards-rasa-zinfandel/w/7799794",
    usp: "Silver at India Wine Awards.",
    personality: "Ripe, generous and quietly indulgent.",
    personalityLabel: "Romantic",
    image: rasaZinImg.url,
    question: "What did you notice?",
    options: ["Berry", "Spice", "Smooth"],
    sommelierNote: "Jammy and gentle — a wine that feels like a warm evening.",
    tastingSteps: defaultSteps,
    nextPour: "Rasa Syrah",
    nextPourReason: "If this softness charmed you, we'd move into deeper Rasa Syrah next.",
    active: true,
  },
  // 7
  {
    id: 7,
    slug: "rasa-syrah",
    name: "Rasa Syrah",
    subtitle: "Premium Syrah",
    journeyTag: "Bold",
    description:
      "Indulge in Rasa Syrah, a Gold winner at the Paris Wine Cup and Silver at Syrah Du Monde. With fragrant aromas and a hint of black pepper spice, it's simply delightful.",
    notes: ["Deep spice", "Dark fruit", "Smooth"],
    awards: [
      { medal: "Gold", competition: "Paris Wine Cup" },
      { medal: "Silver", competition: "Syrah Du Monde" },
    ],
    tastingNotes:
      "Cassis, black pepper and violet with a supple, long finish — polished and full of character.",
    foodPairing: ["Cheezy Chicken Treat", "Murg Chatpata", "Classic Margherita Pizza"],
    vivino: "https://www.vivino.com/US/en/sula-vineyards-rasa-syrah-nashik-red-wine/w/1176482",
    usp: "Gold at Paris Wine Cup; Silver at Syrah Du Monde.",
    personality: "Powerful, indulgent and unforgettable.",
    personalityLabel: "Bold Explorer",
    image: rasaSyrahImg.url,
    question: "What stood out?",
    options: ["Deep spice", "Dark fruit", "Smooth finish"],
    sommelierNote: "Our boldest pour. Swirl gently, breathe it in, then sip slowly.",
    tastingSteps: [
      "Swirl the glass gently",
      "Take a generous sip",
      "Notice the spice and long finish",
    ],
    nextPour: "Rasa Cabernet Sauvignon",
    nextPourReason: "If this spoke to you, we'd take you deeper with Rasa Cabernet Sauvignon.",
    active: true,
  },
  // 8
  {
    id: 8,
    slug: "rasa-cabernet-sauvignon",
    name: "Rasa Cabernet Sauvignon",
    subtitle: "Flagship Cabernet",
    journeyTag: "Flagship",
    description:
      "Luxuriate in Rasa Cabernet Sauvignon, our flagship red wine and the first Indian wine to win a Gold Medal at the Global Cabernet Sauvignon Masters 2024. With its deep flavours, it's a must-have for any wine enthusiast.",
    notes: ["Blackcurrant", "Cedar", "Structured"],
    awards: [{ medal: "Gold", competition: "Global Cabernet Sauvignon Masters 2024" }],
    tastingNotes: "Blackcurrant, tobacco and cedar with fine, silken tannins.",
    foodPairing: ["Wine Glazed Chicken Wings", "Chicken Cheezy Treat", "Classic Margherita Pizza"],
    vivino: "https://www.vivino.com/US/en/rasa-cabernet-sauvignon-nashik-red-wine-v-p8waq/w/10010166",
    usp: "First Indian Gold winner — Global Cabernet Sauvignon Masters 2024.",
    personality: "Refined, structured and quietly powerful.",
    personalityLabel: "Bold Explorer",
    image: rasaCabImg.url,
    question: "What did you feel?",
    options: ["Blackcurrant", "Cedar", "Silky tannin"],
    sommelierNote: "Our flagship — a slow, contemplative red. Sip and let it unfold.",
    tastingSteps: defaultSteps,
    nextPour: "Sparkling Shiraz",
    nextPourReason: "To finish on a celebratory note, we'd pour our Sparkling Shiraz next.",
    active: true,
  },
  // 9
  {
    id: 9,
    slug: "the-source-grenache-rose",
    name: "The Source Grenache Rosé",
    subtitle: "Provence-style Rosé",
    journeyTag: "Lively",
    description:
      "This is a vibrant and easy-drinking expression of this classic varietal, it delights with juicy notes of fresh strawberry, red cherry, and raspberry, layered with a subtle hint of spice and a silky smooth finish.",
    notes: ["Fresh strawberry", "Red cherry", "Raspberry", "Soft spice"],
    awards: [],
    tastingNotes:
      "Strawberry, red cherry and raspberry with a delicate spice lift and a clean finish.",
    foodPairing: ["Watermelon Salad", "Veggie Delight", "Nachos & Salsa"],
    vivino:
      "https://www.vivino.com/US/en/the-source-grenache-rose-nashik-rose-wine-v-3yzcq/w/5922800",
    usp: "A Provence-style rosé bursting with fresh strawberry, red cherry and raspberry.",
    personality: "Romantic and sunlit — ideal for slow afternoons.",
    personalityLabel: "Romantic",
    image: grenacheRoseImg.url,
    question: "What did you feel?",
    options: ["Sunset rooftop", "Garden brunch", "Beach picnic"],
    sommelierNote: "A breath of Provence in Nashik — soft, peachy, sunlit.",
    tastingSteps: defaultSteps,
    nextPour: "The Source Moscato",
    nextPourReason: "If this romance charmed you, we'd end with our sparkling Moscato.",
    active: true,
  },
  // 10
  {
    id: 10,
    slug: "the-source-cabernet-sauvignon",
    name: "The Source Cabernet Sauvignon",
    subtitle: "Estate Cabernet",
    journeyTag: "Elegant",
    description:
      "Enjoy The Source Cabernet Sauvignon, a delightful wine bursting with rich flavours. Its smooth finish makes it a wonderful choice for any occasion.",
    notes: ["Rich", "Smooth", "Elegant"],
    awards: [],
    tastingNotes: "Ripe plum, cocoa and gentle spice with a smooth, refined finish.",
    foodPairing: ["Wine Glazed Chicken Wings", "Chicken Cheezy Treat", "Classic Margherita Pizza"],
    vivino: "https://www.vivino.com/US/en/sula-vineyards-the-source-cabernet-sauvignon/w/9217599",
    usp: "An estate Cabernet crafted for refined, everyday elegance.",
    personality: "Smooth, poised and quietly elegant.",
    personalityLabel: "Refined",
    image: sourceCabImg.url,
    question: "How did it feel?",
    options: ["Rich", "Smooth", "Elegant"],
    sommelierNote: "Refined and rounded — an easy, elegant red.",
    tastingSteps: defaultSteps,
    nextPour: "The Source Moscato",
    nextPourReason: "For a bright finish, we'd take you to our sparkling Moscato.",
    active: true,
  },
  // 11
  {
    id: 11,
    slug: "the-source-moscato",
    name: "The Source Moscato",
    subtitle: "Sparkling Sweet",
    journeyTag: "Indulgent",
    description:
      "Discover The Source Moscato, India's first Moscato and a Gold medal winner at the Asian Sparkling Masters. Indulge in its sweet notes of peach and apricot, complemented by a refreshing, bubbly finish.",
    notes: ["Peach", "Apricot", "Bubbly"],
    awards: [{ medal: "Gold", competition: "Asian Sparkling Masters" }],
    tastingNotes:
      "Sweet notes of peach and apricot, complemented by a refreshing, bubbly finish.",
    foodPairing: [],
    pairingNote: "Ask our wine guide for today's sparkling pairing recommendation.",
    vivino: "https://www.vivino.com/US/en/sula-vineyards-the-source-moscato-nashik/w/12872619",
    usp: "India's first Moscato — Gold at Asian Sparkling Masters.",
    personality: "Playful, indulgent and full of vibes.",
    personalityLabel: "Playful",
    image: sourceMoscatoImg.url,
    question: "Which note shines through?",
    options: ["Peach", "Apricot", "Bubbly finish"],
    sommelierNote: "Gentle bubbles, fruit and balance — a joyful sip.",
    tastingSteps: defaultSteps,
    nextPour: "Sparkling Shiraz",
    nextPourReason: "If this delighted you, we'd move into our Sparkling Shiraz.",
    active: true,
  },
  // 12
  {
    id: 12,
    slug: "sula-brut",
    name: "Sula Brut",
    subtitle: "Traditional Method Brut",
    journeyTag: "Fresh",
    description:
      "Celebrate with Sula Brut, a lively sparkling wine and medalist at the Paris Wine Cup and Decanter Awards. Crisp, refreshing, with citrus and green apple notes—pure joy in every sip.",
    notes: ["Citrus", "Green Apple", "Fine bubbles"],
    awards: [
      { medal: "Medalist", competition: "Paris Wine Cup" },
      { medal: "Medalist", competition: "Decanter Awards" },
    ],
    tastingNotes: "Lemon zest, green apple and brioche on a crisp, mineral finish.",
    foodPairing: ["Murg Chatpata", "Sweet Potato Crisps with Peri Peri Mayo", "Kanda Bhaji"],
    vivino: "https://www.vivino.com/US/en/sula-vineyards-brut/w/1223665",
    usp: "Medalist at Paris Wine Cup and Decanter Awards.",
    personality: "Crisp, bright and celebratory.",
    personalityLabel: "Cheerful",
    image: sulaBrutImg.url,
    question: "What did you feel?",
    options: ["Citrus", "Green apple", "Brioche"],
    sommelierNote: "Bright and mineral — a classic start to a celebration.",
    tastingSteps: defaultSteps,
    nextPour: "Tropicale Rosé",
    nextPourReason: "If this brightness charmed you, we'd move into Tropicale Rosé.",
    active: true,
  },
  // 13
  {
    id: 13,
    slug: "tropicale-rose",
    name: "Tropicale Rosé",
    subtitle: "Sparkling Rosé",
    journeyTag: "Fresh",
    description:
      "Experience Sula's Tropicale Rosé, India's first and only Gold winner at the International Wine Challenge. A refreshing burst of tropical fruit and berry flavours, perfect for any celebration.",
    notes: ["Tropical fruit", "Berries", "Citrus zest"],
    awards: [{ medal: "Gold", competition: "International Wine Challenge" }],
    tastingNotes: "The happiest sparkling rosé — pure bliss, full of tropical notes.",
    foodPairing: ["Murg Chatpata", "Sweet Potato Crisps with Peri Peri Mayo", "Nachos & Salsa"],
    vivino: "https://www.vivino.com/US/en/sula-vineyards-brut-tropicale/w/4488268",
    usp: "India's favourite sparkling — Gold at International Wine Challenge.",
    personality: "Cheerful & vibrant — perfect for celebrations.",
    personalityLabel: "Cheerful",
    image: tropicaleImg.url,
    question: "What did you feel?",
    options: ["Tropical fruit", "Berries", "Citrus zest"],
    sommelierNote: "Light and joyful — a sparkling rosé to wake up your palate.",
    tastingSteps: defaultSteps,
    nextPour: "Sparkling Shiraz",
    nextPourReason: "If this celebration continued, we'd move you into Sparkling Shiraz.",
    active: true,
  },
  // 14
  {
    id: 14,
    slug: "sparkling-shiraz",
    name: "Sparkling Shiraz",
    subtitle: "Sparkling Red",
    journeyTag: "Bold",
    description:
      "Uncork Sula's Sparkling Shiraz, India's first and only sparkling red wine and a Gold Medal winner at the India Wine Awards. Bold and bursting with rich berry flavours—you won't want to miss it.",
    notes: ["Dark berry", "Spice", "Fine bubbles"],
    awards: [{ medal: "Gold", competition: "India Wine Awards" }],
    tastingNotes: "Blackberry, plum and warm spice with a lift of fine bubbles.",
    foodPairing: ["French Fries with Peri Peri Seasoning", "Shev Puri Twist", "Dabeli Bruschetta"],
    vivino: "https://www.vivino.com/US/en/sula-vineyards-sparkling-shiraz/w/7957723",
    usp: "Gold at India Wine Awards — a rare Indian sparkling red.",
    personality: "Playful, celebratory and delightfully bold.",
    personalityLabel: "Playful",
    image: sparklingShirazImg.url,
    question: "What did you notice?",
    options: ["Dark berry", "Spice", "Bubbles"],
    sommelierNote: "A sparkling red — celebratory, unusual, unforgettable.",
    tastingSteps: defaultSteps,
    nextPour: "The Source Moscato",
    nextPourReason: "To finish on a sweet, gentle note, we'd move into The Source Moscato.",
    active: true,
  },
];

// ────────────────────────────────────────────────────────────
// Flights (shared wine references)
// ────────────────────────────────────────────────────────────
export interface Flight {
  id: "A" | "B" | "C" | "D";
  code: string;
  name: string;
  subtitle: string;
  description: string;
  wineIds: number[]; // in order
  glyph: "whites" | "reds" | "signature" | "sparkling";
  active: boolean;
}

export const flights: Flight[] = [
  {
    id: "A",
    code: "crisp-classic",
    name: "Crisp & Classic",
    subtitle: "Whites",
    description: "Bright, refreshing and elegantly expressive.",
    wineIds: [1, 2, 3, 11],
    glyph: "whites",
    active: true,
  },
  {
    id: "B",
    code: "bold-beautiful",
    name: "Bold & Beautiful",
    subtitle: "Reds",
    description: "Rich, layered and full of character.",
    wineIds: [6, 7, 8, 14],
    glyph: "reds",
    active: true,
  },
  {
    id: "C",
    code: "sula-signature",
    name: "Sula Signature",
    subtitle: "Best of Sula",
    description: "A curated collection of Sula favourites.",
    wineIds: [3, 9, 8, 13],
    glyph: "signature",
    active: true,
  },
  {
    id: "D",
    code: "bubbles-bliss",
    name: "Bubbles & Bliss",
    subtitle: "Sparkling",
    description: "Lively, celebratory and beautifully refreshing.",
    wineIds: [12, 13, 14, 11],
    glyph: "sparkling",
    active: false,
  },
];

export function getFlight(id: string | null | undefined): Flight | null {
  if (!id) return null;
  return flights.find((f) => f.id === id) ?? null;
}

export function getFlightWines(id: string | null | undefined): Wine[] {
  const f = getFlight(id);
  if (!f) return [];
  return f.wineIds
    .map((wid) => wines.find((w) => w.id === wid))
    .filter((w): w is Wine => Boolean(w));
}

// Legacy — retained for backward compatibility (used by some copy)
export const journeyLabels = ["Fresh", "Elegant", "Lively", "Bold", "Indulgent"];

export const personalityResults = {
  Cheerful: {
    title: "The Life of the Party",
    description:
      "You're drawn to joyful, celebratory wines. Your spirit is infectious and your palate loves a good sparkle.",
    suggestedPairing: "Kanda Bhaji, mezze, or a charcuterie board",
  },
  Refined: {
    title: "The Connoisseur",
    description:
      "You appreciate complexity and depth. Oak, butter, and elegance speak to your sophisticated palate.",
    suggestedPairing: "Butter garlic prawns or tandoori chicken",
  },
  Romantic: {
    title: "The Dreamer",
    description:
      "Sun-kissed rosés and breezy afternoons are your thing. You find beauty in simplicity.",
    suggestedPairing: "Watermelon & feta salad or light seafood",
  },
  "Bold Explorer": {
    title: "The Adventurer",
    description:
      "You love big, bold flavours that leave an impression. Intensity is your middle name.",
    suggestedPairing: "Tandoori chicken or aged cheese platter",
  },
  Playful: {
    title: "The Free Spirit",
    description:
      "Sweet, bubbly, and full of vibes — you don't take life too seriously, and neither does your wine.",
    suggestedPairing: "Cheese with chilli honey or fruit desserts",
  },
};
