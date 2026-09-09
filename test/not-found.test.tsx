import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFoundContent from "@/app/(public)/_components/NotFoundContent";
import PublicNotFound from "@/app/(public)/not-found";
import RootNotFound from "@/app/not-found";

// UI-404-1: neither notFound() boundary existed before this gate — both fell through
// to Next.js's unstyled default, dropping the user out of the site entirely with no
// way back in (UI_AUDIT.md F10).
describe("NotFoundContent", () => {
  it("offers real recovery paths, not a dead end", () => {
    render(<NotFoundContent />);
    expect(screen.getByRole("heading", { name: /could not be found/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Browse Orders/i })).toHaveAttribute("href", "/orders");
    expect(screen.getByRole("link", { name: /Search the Portal/i })).toHaveAttribute("href", "/search");
  });

  it("carries a Telugu translation of the message", () => {
    render(<NotFoundContent />);
    const teluguText = document.querySelector('[lang="te"]');
    expect(teluguText).toBeInTheDocument();
    expect(teluguText).toHaveClass("font-telugu");
  });
});

describe("app/(public)/not-found.tsx — the common case (removed/renamed post or category)", () => {
  it("renders the shared recovery content", () => {
    render(<PublicNotFound />);
    expect(screen.getByRole("heading", { name: /could not be found/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to Home" })).toBeInTheDocument();
  });
});

describe("app/not-found.tsx — a genuinely unmatched URL, outside the public layout", () => {
  it("renders its own minimal header plus the shared recovery content, since the public layout does not wrap this boundary", () => {
    render(<RootNotFound />);
    expect(screen.getByRole("link", { name: /AP Teacher Desk/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("heading", { name: /could not be found/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse Orders/i })).toBeInTheDocument();
  });
});
