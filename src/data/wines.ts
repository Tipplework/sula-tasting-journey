import wineTropicaleRose from "@/assets/wine-tropicale-rose.jpg";
import wineChardonnay from "@/assets/wine-chardonnay.jpg";
import wineGrenacheRose from "@/assets/wine-grenache-rose.jpg";
import wineRasaSyrah from "@/assets/wine-rasa-syrah.jpg";
import wineMoscato from "@/assets/wine-moscato.jpg";

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
}

export const wines: Wine[] = [
  {
    id: 1,
    name: "Tropicale Rosé",
    subtitle: "Sparkling Rosé",
    journeyTag: "Fresh",
    tastingNotes:
      "The happiest sparkling rosé! A pure bliss, full of tropical notes.",
    foodPairing: ["Kanda Bhaji", "French Fries", "Mezze Platter"],
    vivino:
      "https://www.vivino.com/US/en/sula-vineyards-brut-tropicale/w/4488268",
    usp: "India's favourite Sparkling wine, Gold winner at International Wine Challenge.",
    personality:
      "Cheerful & vibrant – perfect for celebrations and light hearted moments.",
    personalityLabel: "Cheerful",
    image: wineTropicaleRose,
    question: "What do you taste most?",
    options: ["Tropical fruit", "Berries", "Citrus zest"],
  },
  {
    id: 2,
    name: "Dindori Reserve Chardonnay",
    subtitle: "Oak-aged Chardonnay",
    journeyTag: "Elegant",
    tastingNotes:
      "Lemony, silky and rich, this charming Chardonnay is a beautiful expression of the land of Dindori.",
    foodPairing: ["Butter Garlic Prawns", "Veggie Delight"],
    vivino:
      "https://www.vivino.com/US/en/sula-vineyards-dindori-reserve-chardonnay/w/6760667",
    usp: "India's first Gold winner at Paris Wine Cup, premium oak-aged Chardonnay.",
    personality: "Complex & indulgent – a wine for refined palates.",
    personalityLabel: "Refined",
    image: wineChardonnay,
    question: "How does this make you feel?",
    options: ["Sophisticated", "Warm & cozy", "Curious"],
  },
  {
    id: 3,
    name: "The Source Grenache Rosé",
    subtitle: "Provence-style Rosé",
    journeyTag: "Lively",
    tastingNotes:
      "This lively, peachy and luxuriant rosé shouts friends and sun! A favourite.",
    foodPairing: [
      "Watermelon & Feta Salad",
      "Nachos & Salsa",
      "Fish Fingers",
    ],
    vivino:
      "https://www.vivino.com/US/en/the-source-grenache-rose-nashik-rose-wine-v-3yzcq/w/5922800",
    usp: "Provence-style rosé, sustainable winemaking, India's best rosé.",
    personality:
      "Romantic & elegant – ideal for sunny afternoons and social gatherings.",
    personalityLabel: "Romantic",
    image: wineGrenacheRose,
    question: "Where would you drink this?",
    options: ["Sunset rooftop", "Garden brunch", "Beach picnic"],
  },
  {
    id: 4,
    name: "Rasa Syrah",
    subtitle: "Premium Red",
    journeyTag: "Bold",
    tastingNotes:
      "A delicious Syrah; this rich and opulent wine also has a touch of Viognier to give more suppleness. Superb!",
    foodPairing: [
      "Cheezy Chicken Treat",
      "Wine Glazed Wings",
      "Veggie Delight",
    ],
    vivino:
      "https://www.vivino.com/US/en/sula-vineyards-rasa-syrah-nashik-red-wine/w/1176482",
    usp: "Ranked #1 among Indian reds, crafted with sustainable practices.",
    personality: "Bold Explorer – powerful, indulgent, and unforgettable.",
    personalityLabel: "Bold Explorer",
    image: wineRasaSyrah,
    question: "What stands out?",
    options: ["Deep spice", "Dark fruit", "Smooth finish"],
  },
  {
    id: 5,
    name: "The Source Moscato",
    subtitle: "Sparkling Sweet",
    journeyTag: "Indulgent",
    tastingNotes:
      "Lightly sparkling with expressive notes of citrus, lychee, peach, and a perfect balance between acidity and sweetness. Delightful!",
    foodPairing: ["Cheese Board with Chilli Honey"],
    vivino:
      "https://www.vivino.com/US/en/sula-vineyards-the-source-moscato-nashik/w/12872619",
    usp: "India's first Moscato, Gold medal winner at Asian Sparkling Masters.",
    personality:
      "Playful & indulgent – sweet, bubbly, and full of vibes.",
    personalityLabel: "Playful",
    image: wineMoscato,
    question: "What's the dominant note?",
    options: ["Lychee", "Peach", "Citrus"],
  },
];

export const journeyLabels = ["Fresh", "Elegant", "Lively", "Bold", "Indulgent"];

export const personalityResults = {
  Cheerful: {
    title: "The Life of the Party",
    description: "You're drawn to joyful, celebratory wines. Your spirit is infectious and your palate loves a good sparkle.",
    recommendedNext: "Try a Prosecco or a Crémant next!",
    suggestedPairing: "Tapas, bruschetta, or a charcuterie board",
  },
  Refined: {
    title: "The Connoisseur",
    description: "You appreciate complexity and depth. Oak, butter, and elegance speak to your sophisticated palate.",
    recommendedNext: "Explore a Burgundy Chardonnay or a Viognier.",
    suggestedPairing: "Grilled lobster or truffle risotto",
  },
  Romantic: {
    title: "The Dreamer",
    description: "Sun-kissed rosés and breezy afternoons are your thing. You find beauty in simplicity.",
    recommendedNext: "Try a Provence Rosé or a Pinot Grigio.",
    suggestedPairing: "Mediterranean salad or light seafood",
  },
  "Bold Explorer": {
    title: "The Adventurer",
    description: "You love big, bold flavours that leave an impression. Intensity is your middle name.",
    recommendedNext: "Explore a Malbec or a Cabernet Sauvignon.",
    suggestedPairing: "Slow-cooked lamb or aged cheese",
  },
  Playful: {
    title: "The Free Spirit",
    description: "Sweet, bubbly, and full of vibes — you don't take life too seriously, and neither does your wine.",
    recommendedNext: "Try an Asti Spumante or a Riesling.",
    suggestedPairing: "Fruit desserts or spicy Asian cuisine",
  },
};
