import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

import TopicTagBar, { FEATURED_TOPICS } from "@/app/(public)/_components/TopicTagBar";

describe("TopicTagBar — only shows topics with real content", () => {
  it("renders only the topics present in availableTags", () => {
    render(<TopicTagBar availableTags={["Transfers", "TET"]} />);
    expect(screen.getByText(/Transfers\)/)).toBeInTheDocument();
    expect(screen.getByText(/TET 2026\)/)).toBeInTheDocument();
    // A curated topic not in availableTags must not render as a dead-end chip.
    expect(screen.queryByText(/Pensioners\)/)).not.toBeInTheDocument();
  });

  it("renders nothing when no curated topic has real content", () => {
    const { container } = render(<TopicTagBar availableTags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders every curated topic once all of them have real content", () => {
    render(<TopicTagBar availableTags={FEATURED_TOPICS.map((t) => t.tag)} />);
    for (const topic of FEATURED_TOPICS) {
      expect(screen.getByText(topic.label.trim())).toBeInTheDocument();
    }
  });
});
