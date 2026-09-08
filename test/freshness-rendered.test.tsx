import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import OrdersFilterTabs from "@/app/(public)/orders/_components/OrdersFilterTabs";
import CategoryLogList from "@/app/(public)/category/[slug]/_components/CategoryLogList";
import PostDetailPage from "@/app/(public)/posts/[slug]/page";
import { makePost, resetDb } from "./db";

const createdAt = new Date("2026-09-01T00:00:00.000Z");
const documentDate = new Date("2026-08-15T00:00:00.000Z");

describe("FRESHNESS-1 rendered per-document trust presentation", () => {
  it("shows GOIR status only on verified document previews in the Orders listing", () => {
    render(
      <OrdersFilterTabs
        categories={[
          {
            id: "orders",
            nameEn: "Government Orders",
            nameTe: "ప్రభుత్వ ఉత్తర్వులు",
            slug: "govt-orders",
            icon: null,
            color: null,
            _count: { posts: 2 },
            posts: [
              { id: "verified", slug: "verified-order", titleEn: "Verified order", goReference: null, verifiedAgainstGoir: true, createdAt },
              { id: "unverified", slug: "unverified-order", titleEn: "Unverified order", goReference: null, verifiedAgainstGoir: false, createdAt },
            ],
          },
        ]}
      />
    );

    expect(screen.getByText("Verified order").parentElement).toHaveTextContent("GOIR Verified");
    expect(screen.getByText("Unverified order").parentElement).not.toHaveTextContent("GOIR Verified");
    expect(screen.queryByText(/GOIR Verified Repository|all documents verified/i)).not.toBeInTheDocument();
  });

  it("shows GOIR status only on verified rows in the Category listing", () => {
    render(
      <CategoryLogList
        posts={[
          {
            id: "verified-category-row",
            slug: "verified-category-row",
            titleEn: "Verified category document",
            titleTe: "ధృవీకరించిన ఉత్తర్వు",
            summaryTe: [],
            statusBadge: "notification",
            documentType: "go",
            orderState: "current",
            verifiedAgainstGoir: true,
            goReference: null,
            actionDeadline: null,
            createdAt,
            documentDate,
            tags: [],
          },
          {
            id: "unverified-category-row",
            slug: "unverified-category-row",
            titleEn: "Unverified category document",
            titleTe: "ధృవీకరించని ఉత్తర్వు",
            summaryTe: [],
            statusBadge: "notification",
            documentType: "go",
            orderState: "current",
            verifiedAgainstGoir: false,
            goReference: null,
            actionDeadline: null,
            createdAt,
            documentDate,
            tags: [],
          },
        ]}
      />
    );

    expect(screen.getByText("Verified category document").closest("a")).toHaveTextContent("GOIR Verified");
    expect(screen.getByText("Unverified category document").closest("a")).not.toHaveTextContent("GOIR Verified");
    expect(screen.queryByText("GOIR Verified Category")).not.toBeInTheDocument();
  });

  describe("detail page", () => {
    beforeEach(resetDb);

    it("renders GOIR status and neutral source wording only for a verified document", async () => {
      await makePost({
        slug: "verified-detail",
        titleEn: "Verified detail document",
        isDraft: false,
        verifiedAgainstGoir: true,
        sourceUrl: "https://goir.ap.gov.in/orders/verified-detail",
        pdfUrl: "https://drive.google.com/verified-detail",
      });

      const html = renderToStaticMarkup(await PostDetailPage({ params: { slug: "verified-detail" } }));

      expect(html).toContain("GOIR Verified");
      expect(html).toContain('aria-label="Open source link"');
      expect(html).not.toMatch(/GOIR Verified Gazette|Official Source|Last verified|updatedAt/i);
    });

    it("does not render a GOIR badge for an unverified document", async () => {
      await makePost({
        slug: "unverified-detail",
        titleEn: "Unverified detail document",
        isDraft: false,
        verifiedAgainstGoir: false,
        sourceUrl: "https://example.com/source",
        pdfUrl: "https://drive.google.com/unverified-detail",
      });

      const html = renderToStaticMarkup(await PostDetailPage({ params: { slug: "unverified-detail" } }));

      expect(html).not.toContain("GOIR Verified");
      expect(html).not.toMatch(/Last verified|updatedAt/i);
    });
  });
});
