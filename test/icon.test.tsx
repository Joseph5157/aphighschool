import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import Icon, { type IconName } from "@/app/(public)/_components/icons/Icon";

describe("Icon Component", () => {
  const iconNames: IconName[] = [
    "document",
    "search",
    "calculator",
    "calendar",
    "folder",
    "external",
    "arrow-right",
    "chevron-down",
    "check",
    "building",
    "user",
    "scale",
  ];

  it("renders valid inline SVG element for each supported icon name", () => {
    for (const name of iconNames) {
      const { container } = render(<Icon name={name} size={20} className="text-tamarind" />);
      const svg = container.querySelector("svg");

      expect(svg, `Icon ${name} should render SVG`).toBeInTheDocument();
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
      expect(svg).toHaveAttribute("fill", "none");
      expect(svg).toHaveAttribute("stroke", "currentColor");
      expect(svg).toHaveClass("text-tamarind");
    }
  });

  it("returns null for unknown icon name", () => {
    const { container } = render(<Icon name={"invalid-name" as any} />);
    expect(container).toBeEmptyDOMElement();
  });
});
