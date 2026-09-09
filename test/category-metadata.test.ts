// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { generateMetadata } from "../app/(public)/category/[slug]/page";
import { resetDb, seedCategory, testDb } from "./db";

describe("category page generateMetadata", () => {
  beforeEach(resetDb);

  it("does not double up 'Orders' when the category name already ends with it", async () => {
    await seedCategory("govt-orders"); // nameEn: "Government Orders"

    const metadata = await generateMetadata({ params: { slug: "govt-orders" } });

    expect(metadata.title).toBe("Government Orders");
    expect(metadata.title).not.toBe("Government Orders Orders");
  });

  it("appends 'Orders' for a category name that doesn't already carry it", async () => {
    await testDb.category.create({
      data: { nameEn: "Circulars", nameTe: "సర్క్యులర్లు", slug: "circulars" },
    });

    const metadata = await generateMetadata({ params: { slug: "circulars" } });

    expect(metadata.title).toBe("Circulars Orders");
  });

  it("sets a canonical link scoped to the category's own slug", async () => {
    await seedCategory("govt-orders");

    const metadata = await generateMetadata({ params: { slug: "govt-orders" } });

    expect(metadata.alternates?.canonical).toBe("/category/govt-orders");
  });

  it("falls through to the layout default rather than a literal title for an unknown slug", async () => {
    const metadata = await generateMetadata({ params: { slug: "does-not-exist" } });
    expect(metadata.title).toBe("Category Not Found");
  });
});
