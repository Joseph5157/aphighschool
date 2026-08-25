// @vitest-environment node
//
// Task 13 nearly shipped a silent data-loss bug: new post fields were added to
// PostFormClient but not threaded through PostForm and the edit page, so the
// edit form rendered them empty and every save blanked the stored value. This
// file renders the real edit page end to end — page -> PostForm -> PostFormClient
// — and asserts the stored documentType and orderState come back pre-selected.
//
// It fails if ANY link in that chain drops the field, which is precisely the
// shape of the bug.
import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from "vitest";
import { cloneElement, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import EditPostPage from "@/app/admin/posts/[id]/page";
import { resetDb, makePost } from "./db";

/**
 * renderToStaticMarkup cannot descend into an async Server Component, and the
 * edit page renders one (PostForm) which in turn renders PostFormClient. Awaits
 * every async component in the tree so the whole chain really is exercised.
 * Sync components are left alone — PostFormClient uses hooks and must be
 * rendered by React, not called.
 */
async function resolveServerComponents(node: unknown): Promise<unknown> {
  if (Array.isArray(node)) {
    return Promise.all(node.map(resolveServerComponents));
  }
  if (!isValidElement(node)) return node;

  const el = node as React.ReactElement<{ children?: unknown }>;
  if (typeof el.type === "function" && el.type.constructor.name === "AsyncFunction") {
    const render = el.type as (props: unknown) => Promise<unknown>;
    return resolveServerComponents(await render(el.props));
  }
  if (el.props?.children !== undefined) {
    const children = await resolveServerComponents(el.props.children);
    // Spread an array back in as variadic children. Passing it as a single
    // child would make React treat statically-written JSX children as a
    // dynamic list and warn about missing keys.
    return Array.isArray(children)
      ? cloneElement(el, undefined, ...(children as React.ReactNode[]))
      : cloneElement(el, undefined, children as React.ReactNode);
  }
  return el;
}

/** The option the browser would show as chosen for a given <select name>. */
function selectedOption(html: string, name: string): string | null {
  const select = html.match(
    new RegExp(`<select[^>]*name="${name}"[^>]*>([\\s\\S]*?)</select>`)
  );
  if (!select) return null;
  const option = select[1].match(/<option[^>]*\bselected\b[^>]*value="([^"]*)"|<option[^>]*value="([^"]*)"[^>]*\bselected\b/);
  if (!option) return null;
  return option[1] ?? option[2] ?? null;
}

async function renderEdit(id: string) {
  const tree = await resolveServerComponents(await EditPostPage({ params: { id } }));
  return renderToStaticMarkup(tree as React.ReactNode);
}

// The form's `action` is a Server Action (a function). React 18's plain DOM
// renderer has no concept of those and warns that it is an invalid `action`
// attribute; Next's own renderer handles it. Swallow exactly that one message,
// matched on its format string plus the prop name React passes as the first %s
// argument — narrow enough that any other invalid-prop warning still surfaces.
const KNOWN_NOISE = "Invalid value for prop";

beforeAll(() => {
  const realError = console.error;
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    // React passes the prop name back-quoted, as "`action`".
    if (typeof args[0] === "string" && args[0].includes(KNOWN_NOISE) && args[1] === "`action`") {
      return;
    }
    realError(...args);
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("edit form prefill", () => {
  beforeEach(resetDb);

  it("pre-selects the stored document type and order state", async () => {
    const post = await makePost({
      slug: "superseded-memo",
      isDraft: false,
      documentType: "memo",
      orderState: "superseded",
    });

    const html = await renderEdit(post.id);

    expect(selectedOption(html, "documentType")).toBe("memo");
    expect(selectedOption(html, "orderState")).toBe("superseded");
  });

  it("pre-selects a different stored pair, so the assertion is not matching a default", async () => {
    // "current" is the column default and "" the empty documentType, so a
    // component that ignored `initial` entirely would still satisfy the values
    // some posts happen to hold. This post holds neither default.
    const post = await makePost({
      slug: "archived-notification",
      isDraft: false,
      documentType: "notification",
      orderState: "archived",
    });

    const html = await renderEdit(post.id);

    expect(selectedOption(html, "documentType")).toBe("notification");
    expect(selectedOption(html, "orderState")).toBe("archived");
  });

  it("renders no document type selected when the post has none", async () => {
    const post = await makePost({
      slug: "untyped",
      isDraft: false,
      documentType: null,
      orderState: "current",
    });

    const html = await renderEdit(post.id);

    expect(selectedOption(html, "documentType")).toBe("");
    expect(selectedOption(html, "orderState")).toBe("current");
  });

  it("offers every enum value as an option", async () => {
    const post = await makePost({ slug: "options", isDraft: false });
    const html = await renderEdit(post.id);

    const docTypes = html
      .match(/<select[^>]*name="documentType"[^>]*>([\s\S]*?)<\/select>/)![1]
      .match(/value="([^"]*)"/g)!
      .map((v) => v.slice(7, -1));
    expect(docTypes).toEqual([
      "",
      "go",
      "circular",
      "memo",
      "proceeding",
      "notification",
      "other",
    ]);

    const states = html
      .match(/<select[^>]*name="orderState"[^>]*>([\s\S]*?)<\/select>/)![1]
      .match(/value="([^"]*)"/g)!
      .map((v) => v.slice(7, -1));
    expect(states).toEqual(["current", "amended", "superseded", "archived"]);
  });
});
