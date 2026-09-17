import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import RelatedOrdersTimeline from "@/app/(public)/_components/RelatedOrdersTimeline";

describe("RelatedOrdersTimeline", () => {
  const mockRelated = [
    {
      relatedPost: {
        id: "post-1",
        slug: "ap-teachers-transfers-rules-2023",
        titleEn: "AP Teachers Transfer Rules 2023",
        titleTe: "ఉపాధ్యాయుల బదిలీల నిబంధనలు 2023",
        goReference: "G.O. Ms. No. 21",
        documentDate: new Date("2023-05-15"),
        createdAt: new Date("2023-05-15"),
      },
    },
    {
      relatedPost: {
        id: "post-2",
        slug: "ap-teachers-transfers-amendment-2024",
        titleEn: "AP Teachers Transfer Amendment 2024",
        titleTe: null,
        goReference: "G.O. Ms. No. 45",
        documentDate: new Date("2024-06-10"),
        createdAt: new Date("2024-06-10"),
      },
    },
  ];

  it("renders nothing when relatedOrders list is empty or null", () => {
    const { container: c1 } = render(<RelatedOrdersTimeline relatedOrders={[]} label="Background Orders" />);
    expect(c1).toBeEmptyDOMElement();

    const { container: c2 } = render(<RelatedOrdersTimeline relatedOrders={null as any} label="Background Orders" />);
    expect(c2).toBeEmptyDOMElement();
  });

  it("renders a vertical timeline with GO reference, titles and count badge", () => {
    render(<RelatedOrdersTimeline relatedOrders={mockRelated} label="Background & Amending Orders" />);

    expect(screen.getByText("Background & Amending Orders")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    expect(screen.getByText("G.O. Ms. No. 21")).toBeInTheDocument();
    expect(screen.getByText("AP Teachers Transfer Rules 2023")).toBeInTheDocument();
    expect(screen.getByText("ఉపాధ్యాయుల బదిలీల నిబంధనలు 2023")).toBeInTheDocument();

    expect(screen.getByText("G.O. Ms. No. 45")).toBeInTheDocument();
    expect(screen.getByText("AP Teachers Transfer Amendment 2024")).toBeInTheDocument();
  });

  it("links each timeline item to its respective post slug", () => {
    render(<RelatedOrdersTimeline relatedOrders={mockRelated} label="Related Orders" />);

    const link1 = screen.getByRole("link", { name: /AP Teachers Transfer Rules 2023/i });
    expect(link1).toHaveAttribute("href", "/posts/ap-teachers-transfers-rules-2023");

    const link2 = screen.getByRole("link", { name: /AP Teachers Transfer Amendment 2024/i });
    expect(link2).toHaveAttribute("href", "/posts/ap-teachers-transfers-amendment-2024");
  });
});
