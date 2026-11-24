import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PostFormClient from "@/app/admin/posts/_components/PostFormClient";
import { AUTHORING_TEMPLATES } from "@/lib/posts/authoring-templates";

// React's plain DOM renderer does not understand Next Server Action functions.
// A string keeps this component-level test quiet; submission is tested in the
// server-action suite.
const testAction = "/admin/posts/new" as unknown as (formData: FormData) => Promise<void>;

describe("post authoring templates", () => {
  it("covers the four reusable post shapes with distinct guidance", () => {
    expect(AUTHORING_TEMPLATES.map((template) => template.id)).toEqual([
      "short_update",
      "standard_document",
      "recruitment_exam",
      "detailed_explainer",
    ]);
    expect(new Set(AUTHORING_TEMPLATES.map((template) => template.wordTarget)).size).toBe(4);
    expect(
      AUTHORING_TEMPLATES.some((template) =>
        template.checklist.some((item) => item.includes("official PDF"))
      )
    ).toBe(true);
  });

  it("changes guidance without inserting or overwriting article content", () => {
    render(
      <PostFormClient
        action={testAction}
        categories={[]}
        candidatePosts={[]}
      />
    );

    const content = screen.getByLabelText("Structured article HTML (optional)");
    fireEvent.change(content, { target: { value: "<p>My verified draft.</p>" } });

    fireEvent.change(screen.getByLabelText("Post type"), {
      target: { value: "detailed_explainer" },
    });

    expect(screen.getByText("Target: 1,000–1,600 words")).toBeInTheDocument();
    expect(content).toHaveValue("<p>My verified draft.</p>");
    expect(screen.getByText("3 words")).toBeInTheDocument();
  });

  it("keeps the guide selector out of submitted form data", () => {
    const { container } = render(
      <PostFormClient
        action={testAction}
        categories={[]}
        candidatePosts={[]}
      />
    );

    expect(container.querySelector('select[name="authoringTemplate"]')).toBeNull();
    expect(container.querySelector('textarea[name="content"]')).not.toBeNull();
  });
});

