/**
 * Food photography for the Tasting Room menu, mapped by the item's slug
 * (see `itemSlug`). Names come straight from the supplied photo set.
 */
import butterGarlicPrawns from "@/assets/food/butter-garlic-prawns1.png.asset.json";
import cheeseBoard from "@/assets/food/cheese-board-with-chilli-honey.png.asset.json";
import cheesyChicken from "@/assets/food/cheesy-chicken-treat1.png.asset.json";
import fishFinger from "@/assets/food/chilli-lime-cilantro-fish-finger.png.asset.json";
import chips from "@/assets/food/chips.png.asset.json";
import margherita from "@/assets/food/classic-margherita.png.asset.json";
import dabeli from "@/assets/food/dabeli-bruschetta1.png.asset.json";
import frenchFries from "@/assets/food/french-fries-dusted-with-peri-peri1.png.asset.json";
import hummus from "@/assets/food/hummus1.png.asset.json";
import kandaBhaji from "@/assets/food/kanda-bhaji.png.asset.json";
import mezze from "@/assets/food/mezze-platter1.png.asset.json";
import mixNuts from "@/assets/food/mix-nut.png.asset.json";
import murghChatpata from "@/assets/food/murgh-chatpata.png.asset.json";
import nachos from "@/assets/food/nachos-and-salsa.png.asset.json";
import pestoBruschetta from "@/assets/food/pesto-pineapple-and-peppers-bruschetta.png.asset.json";
import scallionChicken from "@/assets/food/scallion-chicken.png.asset.json";
import sevPuri from "@/assets/food/sev-puri-twist1.png.asset.json";
import skilletVeggies from "@/assets/food/skillet-tossed-veggies.png.asset.json";
import sweetPotato from "@/assets/food/sweet-potato-crisp-with-peri-peri-mayo.png.asset.json";
import veggieDelight from "@/assets/food/veggie-delight.png.asset.json";
import watermelonSalad from "@/assets/food/watermelon-basil-and-feta-salad.png.asset.json";
import wildMushroom from "@/assets/food/wild-mushroom-on-toast.png.asset.json";
import chickenWings from "@/assets/food/wine-glazed-chicken-wings.png.asset.json";

export const FOOD_IMAGES: Record<string, string> = {
  "butter-garlic-prawns": butterGarlicPrawns.url,
  "cheese-board-with-chilli-honey": cheeseBoard.url,
  "cheesy-chicken-treat": cheesyChicken.url,
  "chili-lime-cilantro-fish-finger": fishFinger.url,
  chips: chips.url,
  "classic-margherita": margherita.url,
  "dabeli-bruschetta": dabeli.url,
  "french-fries-dusted-with-peri-peri": frenchFries.url,
  "hummus-with-pita-bread": hummus.url,
  "kanda-bhaji": kandaBhaji.url,
  "mezze-platter": mezze.url,
  "mix-nuts": mixNuts.url,
  "murgh-chatpata": murghChatpata.url,
  "nachos-and-salsa": nachos.url,
  "pesto-pineapple-and-peppers-bruschetta": pestoBruschetta.url,
  "scallion-chicken": scallionChicken.url,
  "sev-puri-twist": sevPuri.url,
  "skillet-tossed-veggies": skilletVeggies.url,
  "sweet-potato-crisp-with-peri-peri-mayo": sweetPotato.url,
  "veggie-delight": veggieDelight.url,
  "watermelon-basil-and-feta-salad": watermelonSalad.url,
  "wild-mushroom-on-toast": wildMushroom.url,
  "wine-glazed-chicken-wings": chickenWings.url,
};

export function foodImageFor(name: string, slug: string): string | null {
  return FOOD_IMAGES[slug] ?? null;
}
