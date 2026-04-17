export interface Wine {
  id: number;
  name: string;
  subtitle: string;
  journeyTag: string;
  tastingNotes: string;
  foodPairing: string[];
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
}

export const wines: Wine[] = [
  {
    id: 1,
    name: "Tropicale Rosé",
    subtitle: "Sparkling Rosé",
    journeyTag: "Fresh",
    tastingNotes:
      "The happiest sparkling rosé!\nA pure bliss, full of tropical notes.",
    foodPairing: ["Kanda Bhaji", "French Fries", "Mezze Platter"],
    vivino:
      "https://www.vivino.com/US/en/sula-vineyards-brut-tropicale/w/4488268",
    usp: "India's favourite Sparkling wine, Gold winner at International Wine Challenge.",
    personality:
      "Cheerful & vibrant — perfect for celebrations and light-hearted moments.",
    personalityLabel: "Cheerful",
    image: "https://sulavineyards.com/images/media2/home-page/sula-brut-tropicale-home.webp",
    question: "What did you feel?",
    options: ["Tropical fruit", "Berries", "Citrus zest"],
    sommelierNote:
      "We start light and joyful — a sparkling rosé to wake up your palate.",
    tastingSteps: [
      "Take a small sip",
      "Let the bubbles rest on your tongue",
      "Notice the tropical aromas",
    ],
    nextPour: "Sula Brut",
    nextPourReason:
      "If you enjoyed this, I'd take you toward our crisp Sula Brut.",
  },
  {
    id: 2,
    name: "Dindori Reserve Chardonnay",
    subtitle: "Oak-aged Chardonnay",
    journeyTag: "Elegant",
    tastingNotes:
      "Lemony, silky and rich — this charming Chardonnay\nis a beautiful expression of the land of Dindori.",
    foodPairing: ["Butter Garlic Prawns", "Tandoori Chicken", "Veggie Delight"],
    vivino:
      "https://www.vivino.com/US/en/sula-vineyards-dindori-reserve-chardonnay/w/6760667",
    usp: "India's first Gold winner at Paris Wine Cup, premium oak-aged Chardonnay.",
    personality:
      "Complex & indulgent — a wine for refined palates.",
    personalityLabel: "Refined",
    image: "https://sulavineyards.com/images/media2/dindori/dindori-chardonnay-image.webp",
    question: "How does it feel on your palate?",
    options: ["Sophisticated", "Warm & cozy", "Curious"],
    sommelierNote:
      "Now we slow down — oak, lemon and silk. Sip gently, let it bloom.",
    tastingSteps: [
      "Take a sip and hold briefly",
      "Let it sit on your mid-palate",
      "Notice the oak and citrus finish",
    ],
    nextPour: "CBL Reserve",
    nextPourReason:
      "If this elegance moved you, I'd take you toward our Chenin Blanc Late Harvest Reserve.",
  },
  {
    id: 3,
    name: "The Source Grenache Rosé",
    subtitle: "Provence-style Rosé",
    journeyTag: "Lively",
    tastingNotes:
      "This lively, peachy and luxuriant rosé\nshouts friends and sun! A favourite.",
    foodPairing: [
      "Watermelon & Feta Salad",
      "Kanda Bhaji",
      "Fish Fingers",
    ],
    vivino:
      "https://www.vivino.com/US/en/the-source-grenache-rose-nashik-rose-wine-v-3yzcq/w/5922800",
    usp: "Provence-style rosé, sustainable winemaking, India's best rosé.",
    personality:
      "Romantic & elegant — ideal for sunny afternoons and social gatherings.",
    personalityLabel: "Romantic",
    image: "https://thesourcevineyards.com/images/vines/source-grenache-rose.jpg",
    question: "What did you feel?",
    options: ["Sunset rooftop", "Garden brunch", "Beach picnic"],
    sommelierNote:
      "A breath of Provence in Nashik — soft, peachy, sunlit.",
    tastingSteps: [
      "Take a sip",
      "Let it sit briefly",
      "Notice the soft peach and floral notes",
    ],
    nextPour: "Tropicale Rosé",
    nextPourReason:
      "If this charmed you, I'd take you back to our sparkling Tropicale Rosé.",
  },
  {
    id: 4,
    name: "Rasa Syrah",
    subtitle: "Premium Red",
    journeyTag: "Bold",
    tastingNotes:
      "A delicious Syrah — rich and opulent,\nwith a touch of Viognier for more suppleness. Superb!",
    foodPairing: [
      "Tandoori Chicken",
      "Wine Glazed Wings",
      "Cheese Platter",
    ],
    vivino:
      "https://www.vivino.com/US/en/sula-vineyards-rasa-syrah-nashik-red-wine/w/1176482",
    usp: "Ranked #1 among Indian reds, crafted with sustainable practices.",
    personality:
      "Bold Explorer — powerful, indulgent, and unforgettable.",
    personalityLabel: "Bold Explorer",
    image: "https://sulavineyards.com/images/media2/home-page/rasa-syrah-home.webp",
    question: "What stood out?",
    options: ["Deep spice", "Dark fruit", "Smooth finish"],
    sommelierNote:
      "Our boldest pour. Swirl gently, breathe it in, then sip slowly.",
    tastingSteps: [
      "Swirl the glass gently",
      "Take a generous sip",
      "Notice the spice and long finish",
    ],
    nextPour: "Rasa Cabernet Sauvignon",
    nextPourReason:
      "If this spoke to you, I'd take you deeper with our Rasa Cabernet Sauvignon.",
  },
  {
    id: 5,
    name: "The Source Moscato",
    subtitle: "Sparkling Sweet",
    journeyTag: "Indulgent",
    tastingNotes:
      "Lightly sparkling with expressive notes of citrus,\nlychee, peach — a perfect balance of acidity\nand sweetness. Delightful!",
    foodPairing: ["Cheese Platter", "Kanda Bhaji"],
    vivino:
      "https://www.vivino.com/US/en/sula-vineyards-the-source-moscato-nashik/w/12872619",
    usp: "India's first Moscato, Gold medal winner at Asian Sparkling Masters.",
    personality:
      "Playful & indulgent — sweet, bubbly, and full of vibes.",
    personalityLabel: "Playful",
    image: "https://thesourcevineyards.com/images/vines/source-moscato.jpg",
    question: "Which note shines through?",
    options: ["Lychee", "Peach", "Citrus"],
    sommelierNote:
      "We end on a sweet note — gentle bubbles, fruit and balance.",
    tastingSteps: [
      "Take a small sip",
      "Let the sweetness settle",
      "Notice lychee, peach and citrus",
    ],
    nextPour: "Sparkling Shiraz",
    nextPourReason:
      "If this delighted you, I'd take you toward our Sparkling Shiraz or LH Chenin Blanc.",
  },
];

export const journeyLabels = ["Fresh", "Elegant", "Lively", "Bold", "Indulgent"];

export const personalityResults = {
  Cheerful: {
    title: "The Life of the Party",
    description: "You're drawn to joyful, celebratory wines. Your spirit is infectious and your palate loves a good sparkle.",
    suggestedPairing: "Kanda Bhaji, mezze, or a charcuterie board",
  },
  Refined: {
    title: "The Connoisseur",
    description: "You appreciate complexity and depth. Oak, butter, and elegance speak to your sophisticated palate.",
    suggestedPairing: "Butter garlic prawns or tandoori chicken",
  },
  Romantic: {
    title: "The Dreamer",
    description: "Sun-kissed rosés and breezy afternoons are your thing. You find beauty in simplicity.",
    suggestedPairing: "Watermelon & feta salad or light seafood",
  },
  "Bold Explorer": {
    title: "The Adventurer",
    description: "You love big, bold flavours that leave an impression. Intensity is your middle name.",
    suggestedPairing: "Tandoori chicken or aged cheese platter",
  },
  Playful: {
    title: "The Free Spirit",
    description: "Sweet, bubbly, and full of vibes — you don't take life too seriously, and neither does your wine.",
    suggestedPairing: "Cheese with chilli honey or fruit desserts",
  },
};
