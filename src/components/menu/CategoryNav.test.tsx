import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryNav } from "./CategoryNav";

const tabs = [
  { id: "food-cocktails", name: "Cocktails" },
  { id: "food-pizza", name: "Pizza" },
];

describe("CategoryNav", () => {
  it("renders real tab buttons with the active one selected", () => {
    render(
      <CategoryNav tabs={tabs} activeId="food-pizza" onSelect={() => {}} />,
    );
    const list = screen.getByRole("tablist");
    expect(list).toBeInTheDocument();
    const pizza = screen.getByRole("tab", { name: "Pizza" });
    expect(pizza).toHaveAttribute("aria-selected", "true");
    expect(pizza).toHaveAttribute("aria-controls", "food-pizza");
    expect(screen.getByRole("tab", { name: "Cocktails" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("reports the section id when a tab is pressed", () => {
    const onSelect = vi.fn();
    render(<CategoryNav tabs={tabs} activeId="food-cocktails" onSelect={onSelect} />);
    screen.getByRole("tab", { name: "Pizza" }).click();
    expect(onSelect).toHaveBeenCalledWith("food-pizza");
  });

  it("hides the rail when there is nothing to navigate between", () => {
    render(<CategoryNav tabs={[tabs[0]]} activeId={tabs[0].id} onSelect={() => {}} />);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });
});
