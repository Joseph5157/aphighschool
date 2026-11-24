import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

import TopicTagBar from "@/app/(public)/_components/TopicTagBar";
import { TOPIC_CHIPS as FEATURED_TOPICS, TOPIC_TERMS } from "@/lib/terminology";

describe("TopicTagBar — only shows topics with real content", () => {
  it("renders only the topics present in availableTags", () => {
    render(<TopicTagBar availableTags={["Transfers", "TET"]} />);
    expect(screen.getByRole("link", { name: "ఉపాధ్యాయ బదిలీలు (Teacher Transfers)" })).toHaveAttribute(
      "href",
      "/search?tag=Transfers"
    );
    expect(screen.getByRole("link", { name: "ఏపీ టెట్ (AP TET)" })).toHaveAttribute("href", "/search?tag=TET");
    // A curated topic not in availableTags must not render as a dead-end chip.
    expect(screen.queryByText(/Pension & Retirement\)/)).not.toBeInTheDocument();
  });

  it("renders nothing when no curated topic has real content", () => {
    const { container } = render(<TopicTagBar availableTags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders every curated topic once all of them have real content", () => {
    render(<TopicTagBar availableTags={FEATURED_TOPICS.map((t) => t.tag)} />);
    for (const topic of FEATURED_TOPICS) {
      expect(screen.getByText(topic.label)).toBeInTheDocument();
    }
  });
});

describe("TERM-TOPICS-1 chip set", () => {
  it("is exactly the fifteen approved §7 topics, in plan order, labelled Telugu (English)", () => {
    expect(FEATURED_TOPICS).toEqual(
      TOPIC_TERMS.map((t) => ({ tag: t.tag, label: `${t.telugu[0]} (${t.display})` }))
    );
    expect(FEATURED_TOPICS).toHaveLength(15);
  });

  it("no longer carries the unapproved MDM and Textbooks chips", () => {
    const tags = FEATURED_TOPICS.map((t) => t.tag);
    expect(tags).not.toContain("MDM");
    expect(tags).not.toContain("Textbooks");
  });
});
