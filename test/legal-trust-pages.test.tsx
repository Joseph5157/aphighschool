import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/(public)/about/page";
import ContactPage from "@/app/(public)/contact/page";
import PrivacyPage from "@/app/(public)/privacy/page";
import TermsPage from "@/app/(public)/terms/page";
import DisclaimerPage from "@/app/(public)/disclaimer/page";
import Footer from "@/app/(public)/_components/Footer";

describe("Phase G — Legal, Trust and Support Pages", () => {
  it("renders About page with scope lock and independence callout", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("About AP Teacher Desk");
    expect(screen.getByText(/AP School Education/i)).toBeInTheDocument();
    expect(screen.getByText(/independent, unofficial/i)).toBeInTheDocument();
  });

  it("renders Contact page with report instructions and placeholder", () => {
    render(<ContactPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Contact & Support");
    expect(screen.getByText(/OWNER_ACTION_REQUIRED/i)).toBeInTheDocument();
  });

  it("renders Privacy Policy page declaring client-side calculations and no tracking", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Privacy Policy");
    expect(screen.getByText(/100% locally inside your web browser/i)).toBeInTheDocument();
  });

  it("renders Terms of Use page requiring verification against official orders", () => {
    render(<TermsPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Terms of Use");
    expect(screen.getByText(/informational and educational purposes only/i)).toBeInTheDocument();
  });

  it("renders Disclaimer page stating estimates and non-government status", () => {
    render(<DisclaimerPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Calculator & Content Disclaimer");
    expect(screen.getByText(/NOT an official portal/i)).toBeInTheDocument();
    expect(screen.getByText(/informational estimates only/i)).toBeInTheDocument();
  });

  it("renders Footer component with all 5 legal and trust links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Contact & Support" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Terms of Use" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "Disclaimer" })).toHaveAttribute("href", "/disclaimer");
  });
});
