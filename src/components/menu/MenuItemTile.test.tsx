import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MenuItemTile } from "./MenuItemTile";
import type { MenuItemView } from "@/lib/menu/api";

const base: MenuItemView = {
  id: "1",
  name: "Cheesy Chicken Treat",
  description: "Grilled chicken with a cheese crust.",
  calories: 670,
  standardPrice: 595,
  bottlePrice: null,
  smallerBottlePrice: null,
  glassPrice: null,
  pairing: "Rāsā Syrah",
  unavailable: false,
  tags: ["non_vegetarian"],
};

describe("MenuItemTile", () => {
  it("renders as an accessible interactive tile carrying the approved values", () => {
    const onOpen = vi.fn();
    render(
      <ul>
        <MenuItemTile
          item={base}
          family="food"
          categoryName="Quick Bites"
          onOpen={onOpen}
        />
      </ul>,
    );
    const tile = screen.getByRole("button", {
      name: /Cheesy Chicken Treat, Quick Bites/i,
    });
    expect(tile).toHaveAttribute("type", "button");
    expect(screen.getByText("₹595")).toBeInTheDocument();
    expect(screen.getByText(/670 kcal/)).toBeInTheDocument();
    expect(screen.getByAltText("Non-vegetarian")).toBeInTheDocument();
    expect(screen.getByText(/Pairs well with Rāsā Syrah/)).toBeInTheDocument();
    tile.click();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("shows the three wine pours instead of a single price", () => {
    render(
      <ul>
        <MenuItemTile
          item={{
            ...base,
            name: "Rāsā Syrah",
            standardPrice: null,
            bottlePrice: 2500,
            smallerBottlePrice: 1400,
            glassPrice: 650,
            pairing: null,
            tags: [],
          }}
          family="wine"
          categoryName="Red"
          onOpen={() => {}}
        />
      </ul>,
    );
    expect(screen.getByText("Bottle")).toBeInTheDocument();
    expect(screen.getByText("₹2500")).toBeInTheDocument();
    expect(screen.getByText("375 ml")).toBeInTheDocument();
    expect(screen.getByText("₹1400")).toBeInTheDocument();
    expect(screen.getByText("Glass")).toBeInTheDocument();
    expect(screen.getByText("₹650")).toBeInTheDocument();
  });
});
