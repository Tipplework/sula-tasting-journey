/**
 * Tasting Room menu — verified content extracted from
 * "SULA_TR MENU 31072026-2.pdf" (the authoritative source).
 *
 * Prices were decoded from the PDF's embedded font vectors (not OCR) and
 * cross-checked against a 300dpi OCR pass. Dietary markers were classified
 * from the PDF's vector fill colours, so they match the printed icons exactly.
 *
 * Columns: bottle = 750ml, smallerBottle = 375ml, glass = 125ml pour.
 * This file is the seed/fallback source of truth; the live menu is served
 * from the database so the team can edit it without a deploy.
 */

export type DietaryTag =
  | "vegetarian"
  | "non_vegetarian"
  | "seafood"
  | "gluten_free"
  | "contains_dairy"
  | "vegan"
  | "contains_nuts";

export interface SeedItem {
  name: string;
  description?: string;
  calories?: number;
  /** single price used for cocktails, drinks and food */
  standardPrice?: number;
  bottlePrice?: number;
  smallerBottlePrice?: number;
  glassPrice?: number;
  pairing?: string;
  tags?: DietaryTag[];
}

export interface SeedCategory {
  slug: string;
  name: string;
  /** wine categories show the three-column bottle/375ml/glass price grid */
  headingStyle: "wine" | "default";
  items: SeedItem[];
}

export const MENU_FOOTNOTES = [
  "Taxes will be charged as applicable.",
  "125ml pour per wine glass.",
  "Should you have any allergens to any ingredient, please bring it to our attention.",
  "Food is cooked in refined sunflower oil, olive oil or butter.",
  "A 2000 Kcalorie daily diet is used as the basis for general nutrition advice; however individual Kcalorie needs may vary.",
  "We use dairy-based Paneer. No Analogue Paneer is used in any of our preparations.",
];

export const DIETARY_LABELS: Record<DietaryTag, string> = {
  vegetarian: "Vegetarian",
  non_vegetarian: "Non-Vegetarian",
  seafood: "Sea Food",
  gluten_free: "Gluten Free",
  contains_dairy: "Contains Dairy",
  vegan: "Vegan",
  contains_nuts: "Contains Nuts",
};

export const TASTING_ROOM_MENU: SeedCategory[] = [
  {
    slug: "sparkling",
    name: "Sparkling",
    headingStyle: "wine",
    items: [
      {
        name: "The Source Moscato",
        description:
          "Lightly sparkling with expressive notes of citrus, lychee, peach, and a perfect balance between acidity and sweetness. Delightful!",
        bottlePrice: 1865,
        smallerBottlePrice: 1025,
        glassPrice: 425,
      },
      {
        name: "Sula Tropicale Rosé",
        description:
          "The happiest sparkling rosé! A pure bliss, full of tropicale notes",
        bottlePrice: 1865,
        smallerBottlePrice: 1025,
        glassPrice: 425,
      },
      {
        name: "Sula Sparkling Shiraz",
        description:
          "India's first and only sparkling red wine; a beautiful balance between sweetness and acidity, with charming notes of pomegranate and spices",
        bottlePrice: 1795,
        smallerBottlePrice: 985,
      },
    ],
  },
  {
    slug: "white",
    name: "White",
    headingStyle: "wine",
    items: [
      {
        name: "The Source Sauvignon Blanc Reserve",
        description:
          "An amazing Sauvignon Blanc, with a touch of oak and charming tropicale notes",
        bottlePrice: 1435,
        smallerBottlePrice: 785,
        glassPrice: 350,
      },
      {
        name: "Dindori Reserve Chardonnay",
        description:
          "Lemony, silky and rich, this charming Chardonnay is a beautiful expression of the Land of Dindori",
        bottlePrice: 1385,
        smallerBottlePrice: 755,
        glassPrice: 350,
      },
      {
        name: "The Source Chenin Blanc Reserve",
        description:
          "Partially oak-aged, this wine is vivacious, elegant, with a charming complexity",
        bottlePrice: 1325,
        smallerBottlePrice: 725,
        glassPrice: 350,
      },
    ],
  },
  {
    slug: "rose",
    name: "Rosé",
    headingStyle: "wine",
    items: [
      {
        name: "The Source Grenache Rosé",
        description:
          "This lively, peachy and luxuriant rosé shouts friends and sun! A favourite",
        bottlePrice: 1440,
        smallerBottlePrice: 805,
        glassPrice: 370,
      },
    ],
  },
  {
    slug: "red",
    name: "Red",
    headingStyle: "wine",
    items: [
      {
        name: "Rãsã Cabernet Sauvignon",
        description:
          "A powerful, elegant and dense Cabernet Sauvignon for a memorable experience. Outstanding!",
        bottlePrice: 2460,
        smallerBottlePrice: 1375,
        glassPrice: 490,
      },
      {
        name: "Rãsã Syrah",
        description:
          "A delicious Syrah; this rich and opulent wine also has a touch of Viognier to give more suppleness. Superb!",
        bottlePrice: 2165,
        smallerBottlePrice: 1225,
        glassPrice: 445,
      },
      {
        name: "Rãsã Zinfandel",
        description:
          "Vivacious, plummy and smooth. Rãsã Zinfandel is a wine you will remember",
        bottlePrice: 1950,
        smallerBottlePrice: 1075,
        glassPrice: 415,
      },
      {
        name: "The Source Cabernet Sauvignon",
        description: "A fresh Cabernet Sauvignon, refined and velvety",
        bottlePrice: 1615,
        smallerBottlePrice: 915,
        glassPrice: 405,
      },
      {
        name: "The Source Pinot Noir",
        description:
          "An elegant and delicate wine with light ruby colour and aromas of red cherries and raspberries",
        bottlePrice: 1560,
      },
      {
        name: "Dindori Reserve Shiraz",
        description:
          "This fiery Shiraz will enchant you with its smoky and spicy notes",
        bottlePrice: 1535,
        glassPrice: 385,
      },
      {
        name: "The Source Grenache Red",
        description:
          "A silky smooth Grenache red, with juicy notes of fresh strawberry, red cherry, and raspberry, layered with a subtle hint of spice",
        bottlePrice: 1535,
        smallerBottlePrice: 875,
        glassPrice: 385,
      },
    ],
  },
  {
    slug: "dessert-wine",
    name: "Dessert",
    headingStyle: "wine",
    items: [
      {
        name: "Sula Late Harvest Chenin Blanc",
        description:
          "A mouthwatering dessert wine, with tremendous notes of honeycomb and tropicale fruits",
        bottlePrice: 1375,
        smallerBottlePrice: 755,
        glassPrice: 350,
      },
    ],
  },
  {
    slug: "cocktails",
    name: "Cocktails",
    headingStyle: "default",
    items: [
      {
        name: "Pears Impression",
        description:
          "Unwind with a chic blend of pear, aromatic rosemary, and sparkling rosé—your new go-to sip.",
        standardPrice: 595,
      },
      {
        name: "Watermelon & Basil Bramble",
        description:
          "Elevate your sip with a refreshing mix of watermelon, basil, and a sparkling rosé finish.",
        standardPrice: 575,
      },
      {
        name: "Strawberry Spritzer",
        description:
          "Sweet strawberry syrup meets crisp white wine and mint for a sparkling treat.",
        standardPrice: 495,
      },
      {
        name: "Sangria",
        description:
          "A colorful medley of wine and fresh fruit for the perfect party sip.",
        standardPrice: 495,
      },
      {
        name: "Bellini",
        description:
          "Mix your favorite syrup with Sparkling Wine for a flavorful Bellini. (Peach/Passion Fruit/Kiwi/Strawberry)",
        standardPrice: 475,
      },
      {
        name: "Mimosa",
        description:
          "Hit the dance floor with Mimosa magic, where citrus meets sparkle.",
        standardPrice: 475,
      },
    ],
  },
  {
    slug: "drinks",
    name: "Drinks",
    headingStyle: "default",
    items: [
      { name: "Aerated Drink", calories: 105, standardPrice: 195 },
      { name: "Lemon Iced Tea", calories: 18, standardPrice: 195 },
      {
        name: "Cappuccino",
        calories: 128.9,
        standardPrice: 195,
        tags: ["contains_dairy"],
      },
      { name: "Canned Juice", calories: 124, standardPrice: 195 },
      { name: "Espresso", calories: 2, standardPrice: 155 },
      { name: "Bottled Water", calories: 0, standardPrice: 125 },
    ],
  },
  {
    slug: "small-plates",
    name: "Small Plates",
    headingStyle: "default",
    items: [
      {
        name: "Butter Garlic Prawns",
        description:
          "Juicy prawns sautéed in rich butter, garlic and finished with cream.",
        pairing: "Dindori Reserve Chardonnay",
        calories: 335,
        standardPrice: 795,
        tags: ["seafood", "contains_dairy"],
      },
      {
        name: "Cheese Board With Chilli Honey",
        description:
          "Four types of cheese with crudites, cream crackers and olives.",
        pairing: "Rãsã Cabernet Sauvignon",
        calories: 471,
        standardPrice: 615,
        tags: ["vegetarian", "contains_dairy"],
      },
      {
        name: "Wine Glazed Chicken Wings",
        description:
          "Juicy wings tossed in a wine glaze, served with a herby blue cheese dip.",
        pairing: "The Source Cabernet Sauvignon",
        calories: 585,
        standardPrice: 540,
        tags: ["non_vegetarian", "contains_dairy"],
      },
      {
        name: "Scallion Chicken",
        description:
          "Juicy chicken stir-fried with crunchy scallions and aromatic seasoning.",
        pairing: "Rãsã Zinfandel",
        calories: 523,
        standardPrice: 510,
        tags: ["non_vegetarian", "contains_nuts"],
      },
      {
        name: "Chili Lime Cilantro Fish Finger",
        description:
          "Golden fish fingers with a kick of chilli, lime zest, and herbs.",
        pairing: "The Source Sauvignon Blanc Reserve",
        calories: 420,
        standardPrice: 510,
        tags: ["seafood"],
      },
      {
        name: "Mezze Platter",
        description:
          "An artisanal selection of classic middle eastern dips, arabic bread.",
        pairing: "Sula Tropicale Rosé",
        calories: 482,
        standardPrice: 410,
        tags: ["vegetarian", "contains_dairy", "contains_nuts"],
      },
      {
        name: "Skillet Tossed Veggies",
        description: "Exotic vegetables tossed with herbs and olive oil.",
        pairing: "The Source Sauvignon Blanc Reserve",
        calories: 185,
        standardPrice: 385,
        tags: ["vegetarian", "vegan"],
      },
      {
        name: "Kanda Bhaji",
        pairing: "Sula Sparkling Shiraz",
        calories: 350,
        standardPrice: 305,
        tags: ["vegetarian", "vegan"],
      },
    ],
  },
  {
    slug: "quick-bites",
    name: "Quick Bites",
    headingStyle: "default",
    items: [
      {
        name: "Murgh Chatpata",
        description:
          "Spicy tangy marinated chicken fingers fried to perfection.",
        pairing: "Rãsã Cabernet Sauvignon",
        calories: 855,
        standardPrice: 465,
        tags: ["non_vegetarian"],
      },
      {
        name: "Nachos And Salsa",
        description:
          "Gluten free corn tortilla chips smothered in melted cheese, salsa and your favorite toppings.",
        pairing: "The Source Grenache Rosé",
        calories: 394,
        standardPrice: 355,
        tags: ["vegetarian", "contains_dairy", "gluten_free"],
      },
      {
        name: "Sweet Potato Crisp With Peri Peri Mayo",
        description:
          "Crispy sweet potato chips served with a spicy peri peri mayo dip.",
        pairing: "Sula Tropicale Rosé",
        calories: 728,
        standardPrice: 345,
        tags: ["vegetarian", "contains_dairy"],
      },
      {
        name: "Hummus With Pita Bread",
        description:
          "Our version of hummus dusted with homemade chilli peanut.",
        pairing: "The Source Chenin Blanc Reserve",
        calories: 387,
        standardPrice: 345,
        tags: ["vegetarian", "contains_nuts"],
      },
      {
        name: "Mix Nuts",
        description: "A classic blend of cashews, almonds and pistachios.",
        pairing: "The Source Grenache Rosé",
        calories: 780,
        standardPrice: 335,
        tags: ["vegetarian", "contains_nuts"],
      },
      {
        name: "French Fries Dusted With Peri Peri",
        pairing: "Sula Tropicale Rosé",
        calories: 780,
        standardPrice: 305,
        tags: ["vegetarian"],
      },
      {
        name: "Sev Puri Twist",
        description:
          "Our take on street chaat with the twist of monaco & balsamic.",
        pairing: "The Source Grenache Rosé",
        calories: 426,
        standardPrice: 295,
        tags: ["vegetarian"],
      },
      {
        name: "Chips",
        description: "The ultimate wine-time snack, everyone's favourite.",
        calories: 297,
        standardPrice: 100,
        tags: ["vegetarian"],
      },
    ],
  },
  {
    slug: "salad",
    name: "Salad",
    headingStyle: "default",
    items: [
      {
        name: "Watermelon, Basil & Feta Salad",
        description:
          "Juicy watermelon and creamy feta topped with fresh basil and citrus dressing.",
        pairing: "The Source Grenache Rosé",
        calories: 200,
        standardPrice: 385,
        tags: ["vegetarian", "contains_dairy"],
      },
    ],
  },
  {
    slug: "from-the-bread-box",
    name: "From The Bread Box",
    headingStyle: "default",
    items: [
      {
        name: "Wild Mushroom On Toast",
        description:
          "Earthy wild mushrooms and rich cheddar on crisp artisanal toast.",
        pairing: "Dindori Reserve Chardonnay",
        calories: 470,
        standardPrice: 410,
        tags: ["vegetarian", "contains_dairy"],
      },
      {
        name: "Dabeli Bruschetta",
        description:
          "Bruschetta topped with sev, peanut, chutney & spicy-sweet dabeli masala.",
        pairing: "Rãsã Cabernet Sauvignon",
        calories: 550,
        standardPrice: 345,
        tags: ["vegetarian", "contains_nuts"],
      },
      {
        name: "Pesto Pineapple & Peppers Bruschetta",
        description:
          "A unique medley of bell peppers & pineapple topped on basil pesto bread.",
        pairing: "The Source Sauvignon Blanc Reserve",
        calories: 432,
        standardPrice: 315,
        tags: ["vegetarian", "contains_dairy", "contains_nuts"],
      },
    ],
  },
  {
    slug: "pizza",
    name: "Pizza",
    headingStyle: "default",
    items: [
      {
        name: "Cheesy Chicken Treat",
        description: "Pizza loaded with creamy cheesy chicken.",
        pairing: "Rãsã Syrah",
        calories: 670,
        standardPrice: 595,
        tags: ["non_vegetarian", "contains_dairy"],
      },
      {
        name: "Veggie Delight",
        description: "Pizza topped with generous farm fresh vegetables.",
        pairing: "The Source Grenache Rosé",
        calories: 528,
        standardPrice: 510,
        tags: ["vegetarian", "contains_dairy"],
      },
      {
        name: "Classic Margherita",
        description: "A thin crust topped with cheese and fresh basil leaves.",
        pairing: "Dindori Reserve Chardonnay",
        calories: 610,
        standardPrice: 510,
        tags: ["vegetarian", "contains_dairy"],
      },
    ],
  },
  {
    slug: "dessert",
    name: "Dessert",
    headingStyle: "default",
    items: [
      {
        name: "Selection of Ice Creams",
        description:
          "Scoop up your favorite! A tempting range of classic flavors.",
        calories: 295,
        standardPrice: 410,
        tags: ["vegetarian", "contains_dairy", "contains_nuts"],
      },
    ],
  },
];
