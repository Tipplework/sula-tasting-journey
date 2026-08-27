/**
 * Food photography for the Tasting Room menu, mapped by the item's slug
 * (see `itemSlug`). Names come straight from the supplied photo set.
 */
import butterGarlicPrawns from "@/assets/food/butter-garlic-prawns1.webp";
import cheeseBoard from "@/assets/food/cheese-board-with-chilli-honey.webp";
import cheesyChicken from "@/assets/food/cheesy-chicken-treat1.webp";
import fishFinger from "@/assets/food/chilli-lime-cilantro-fish-finger.webp";
import chips from "@/assets/food/chips.webp";
import margherita from "@/assets/food/classic-margherita.webp";
import dabeli from "@/assets/food/dabeli-bruschetta1.webp";
import frenchFries from "@/assets/food/french-fries-dusted-with-peri-peri1.webp";
import hummus from "@/assets/food/hummus1.webp";
import kandaBhaji from "@/assets/food/kanda-bhaji.webp";
import mezze from "@/assets/food/mezze-platter1.webp";
import mixNuts from "@/assets/food/mix-nut.webp";
import murghChatpata from "@/assets/food/murgh-chatpata.webp";
import nachos from "@/assets/food/nachos-and-salsa.webp";
import pestoBruschetta from "@/assets/food/pesto-pineapple-and-peppers-bruschetta.webp";
import scallionChicken from "@/assets/food/scallion-chicken.webp";
import sevPuri from "@/assets/food/sev-puri-twist1.webp";
import skilletVeggies from "@/assets/food/skillet-tossed-veggies.webp";
import sweetPotato from "@/assets/food/sweet-potato-crisp-with-peri-peri-mayo.webp";
import veggieDelight from "@/assets/food/veggie-delight.webp";
import watermelonSalad from "@/assets/food/watermelon-basil-and-feta-salad.webp";
import wildMushroom from "@/assets/food/wild-mushroom-on-toast.webp";
import chickenWings from "@/assets/food/wine-glazed-chicken-wings.webp";

export const FOOD_IMAGES: Record<string, string> = {
  "butter-garlic-prawns": butterGarlicPrawns,
  "cheese-board-with-chilli-honey": cheeseBoard,
  "cheesy-chicken-treat": cheesyChicken,
  "chili-lime-cilantro-fish-finger": fishFinger,
  chips: chips,
  "classic-margherita": margherita,
  "dabeli-bruschetta": dabeli,
  "french-fries-dusted-with-peri-peri": frenchFries,
  "hummus-with-pita-bread": hummus,
  "kanda-bhaji": kandaBhaji,
  "mezze-platter": mezze,
  "mix-nuts": mixNuts,
  "murgh-chatpata": murghChatpata,
  "nachos-and-salsa": nachos,
  "pesto-pineapple-and-peppers-bruschetta": pestoBruschetta,
  "scallion-chicken": scallionChicken,
  "sev-puri-twist": sevPuri,
  "skillet-tossed-veggies": skilletVeggies,
  "sweet-potato-crisp-with-peri-peri-mayo": sweetPotato,
  "veggie-delight": veggieDelight,
  "watermelon-basil-and-feta-salad": watermelonSalad,
  "wild-mushroom-on-toast": wildMushroom,
  "wine-glazed-chicken-wings": chickenWings,
};

export function foodImageFor(name: string, slug: string): string | null {
  return FOOD_IMAGES[slug] ?? null;
}

/**
 * The original menu seed stored temporary remote asset URLs in image_url.
 * Prefer the bundled photograph for known dishes so the admin and guest menu
 * stay independent of expired or deployment-specific URLs. Uploaded CMS
 * photos remain authoritative for dishes without a bundled photograph.
 */
export function resolveMenuItemImage(
  name: string,
  imageUrl?: string | null,
): string | null {
  const slug = name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return FOOD_IMAGES[slug] ?? imageUrl?.trim() ?? null;
}
