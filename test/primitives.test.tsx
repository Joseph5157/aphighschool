// Behaviour changed by UI-SYSTEM-2, and the carried-forward defects it closed.
//
// These assert the CONTRACT of each primitive rather than its exact classes, so
// a restyle does not break them but a regression in target size, state
// signalling or label association does.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import fs from "node:fs";
import path from "node:path";
import Button from "@/app/(public)/_components/Button";
import IconButton from "@/app/(public)/_components/IconButton";
import Input from "@/app/(public)/_components/Input";
import Textarea from "@/app/(public)/_components/Textarea";
import Checkbox from "@/app/(public)/_components/Checkbox";
import NativeSelect from "@/app/(public)/_components/NativeSelect";
import Field from "@/app/(public)/_components/Field";
import { PaginationLink } from "@/app/(public)/_components/Pagination";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/app/(public)/_components/Table";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";

const icon = <svg viewBox="0 0 24 24" />;

/** Reads the pixel value out of a `min-h-[44px]`-style utility. */
function minSize(className: string, axis: "h" | "w"): number | null {
  const match = className.match(new RegExp(`min-${axis}-\\[(\\d+)px\\]`));
  return match ? Number(match[1]) : null;
}

describe("touch targets", () => {
  // UI-SYSTEM-1 carried these forward: Button sm/md were ~28px and ~32px, and
  // pagination links were 32x32.
  it("gives Button md and lg a 44px minimum height", () => {
    for (const [size, floor] of [["md", 44], ["lg", 48]] as const) {
      const { container } = render(<Button size={size}>Go</Button>);
      const height = minSize(container.querySelector("button")!.className, "h");
      expect(height, `Button size=${size}`).toBeGreaterThanOrEqual(floor);
    }
  });

  it("extends Button sm to a 44px hit area without growing its painted box", () => {
    const { container } = render(<Button size="sm">Go</Button>);
    const className = container.querySelector("button")!.className;

    // 36px painted...
    expect(minSize(className, "h")).toBe(36);
    // ...plus 4px of transparent overlay above and below, which is what makes
    // the tappable area 44px without changing page density.
    expect(className).toContain("after:-inset-y-1");
    expect(className).toContain("relative");
  });

  it("gives IconButton a 44px target on both axes", () => {
    const { container } = render(<IconButton label="Close" icon={icon} />);
    const className = container.querySelector("button")!.className;

    expect(minSize(className, "h")).toBeGreaterThanOrEqual(44);
    expect(minSize(className, "w")).toBeGreaterThanOrEqual(44);
  });

  it("gives pagination links a 44px target", () => {
    const { container } = render(<PaginationLink href="/x">2</PaginationLink>);
    const className = container.querySelector("a")!.className;

    expect(minSize(className, "h")).toBeGreaterThanOrEqual(44);
    expect(minSize(className, "w")).toBeGreaterThanOrEqual(44);
  });

  it("gives form controls a 44px minimum height", () => {
    const { container: input } = render(<Input />);
    expect(minSize(input.querySelector("input")!.className, "h")).toBeGreaterThanOrEqual(44);

    const { container: select } = render(<NativeSelect />);
    expect(minSize(select.querySelector("select")!.className, "h")).toBeGreaterThanOrEqual(44);
  });
});

describe("mobile font size", () => {
  // Below 16px, iOS Safari zooms the viewport when the control takes focus.
  // This is why the base size is text-base and the smaller size is behind `sm:`.
  it.each([
    ["Input", <Input key="i" />, "input"],
    ["Textarea", <Textarea key="t" />, "textarea"],
    ["NativeSelect", <NativeSelect key="s" />, "select"],
  ])("keeps %s at 16px on mobile", (_name, element, selector) => {
    const { container } = render(element);
    const className = container.querySelector(selector)!.className;

    expect(className).toContain("text-base");
    expect(className).not.toMatch(/(^|\s)text-xs(\s|$)/);
  });
});

describe("component states", () => {
  it("marks a loading Button busy while keeping its accessible name", () => {
    render(<Button isLoading>Save changes</Button>);
    const button = screen.getByRole("button", { name: "Save changes" });

    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
  });

  it("does not mark an idle Button busy", () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
  });

  it("exposes the error state of a control, not just its border colour", () => {
    const { container } = render(<Input error />);
    expect(container.querySelector("input")).toHaveAttribute("aria-invalid", "true");

    const { container: ok } = render(<Input />);
    expect(ok.querySelector("input")).not.toHaveAttribute("aria-invalid");
  });

  it("keeps a disabled control in the accessibility tree", () => {
    render(<Button disabled>Delete</Button>);
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });
});

describe("accessible names", () => {
  it("names an icon-only control", () => {
    render(<IconButton label="Clear search" icon={icon} />);
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
  });

  it("hides the icon itself from assistive technology", () => {
    const { container } = render(<IconButton label="Clear search" icon={icon} />);
    // Otherwise the SVG's contents can be announced alongside the label.
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});

describe("Field associates its parts", () => {
  // The defect: the label, the control and the message were rendered but never
  // linked, so assistive tech was told neither what a field was called nor that
  // it was invalid. TaxCalculatorUI's NumF wrapper hit this 33 times.
  it("links label to control without the caller passing an id", () => {
    render(
      <Field label="Basic pay">
        <Input />
      </Field>,
    );

    expect(screen.getByLabelText("Basic pay")).toBeInTheDocument();
  });

  it("links an error message to the control and marks it invalid", () => {
    render(
      <Field label="Basic pay" errorMessage="Enter a number">
        <Input />
      </Field>,
    );

    const control = screen.getByLabelText("Basic pay");
    expect(control).toHaveAttribute("aria-invalid", "true");

    const describedBy = control.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toBe("Enter a number");
  });

  it("links helper text when there is no error", () => {
    render(
      <Field label="Basic pay" helperText="Monthly, before allowances">
        <Input />
      </Field>,
    );

    const describedBy = screen.getByLabelText("Basic pay").getAttribute("aria-describedby");
    expect(document.getElementById(describedBy!)?.textContent).toBe(
      "Monthly, before allowances",
    );
  });

  it("does not override an id the caller supplied", () => {
    render(
      <Field label="Basic pay" htmlFor="explicit-id">
        <Input id="explicit-id" />
      </Field>,
    );

    expect(screen.getByLabelText("Basic pay")).toHaveAttribute("id", "explicit-id");
  });
});

describe("Checkbox", () => {
  it("associates its label, so the text is part of the hit area", () => {
    render(<Checkbox label="Verified against GOIR" name="verifiedAgainstGoir" />);
    expect(screen.getByRole("checkbox", { name: "Verified against GOIR" })).toBeInTheDocument();
  });

  it("links its description to the input", () => {
    render(
      <Checkbox
        label="Verified against GOIR"
        description="Check only after manually verifying."
        name="verifiedAgainstGoir"
      />,
    );

    const box = screen.getByRole("checkbox");
    const describedBy = box.getAttribute("aria-describedby");
    expect(document.getElementById(describedBy!)?.textContent).toContain(
      "Check only after manually verifying.",
    );
  });

  it("keeps the name and value a form submission needs", () => {
    render(<Checkbox label="Link" name="relatedPostIds" value="post-1" defaultChecked />);
    const box = screen.getByRole("checkbox") as HTMLInputElement;

    expect(box.name).toBe("relatedPostIds");
    expect(box.value).toBe("post-1");
    expect(box.checked).toBe(true);
  });
});

describe("the 33 unassociated tax-calculator fields", () => {
  // UI-AUDIT-1 F13, corrected during UI-DESIGN-1: the defect was not the two
  // pensioner routes originally named but TaxCalculatorUI's NumF wrapper, which
  // renders <Field label><Input/></Field> with no id and is used 33 times.
  // Field now generates and threads the id, so this asserts the real screen
  // rather than only the mechanism.
  it("labels every input the real calculator renders", async () => {
    const { default: TaxCalculatorUI } = await import(
      "@/app/(public)/tools/tax-calculator/_components/TaxCalculatorUI"
    );

    const { container } = render(<TaxCalculatorUI />);
    const inputs = Array.from(container.querySelectorAll("input"));
    expect(inputs.length).toBeGreaterThan(10);

    const unlabelled = inputs.filter((input) => {
      if (input.getAttribute("aria-label")) return false;
      const id = input.getAttribute("id");
      if (!id) return true;
      return !container.querySelector(`label[for="${CSS.escape(id)}"]`);
    });

    expect(unlabelled.map((i) => i.outerHTML.slice(0, 80))).toEqual([]);
  });
});

describe("typography floor in shared primitives", () => {
  // UI-SYSTEM-1 raised 21 occurrences and UI-SYSTEM-2 reported the directory
  // clear. It was not: the sweep matched `text-[9px]`, `text-[10px]` and
  // `text-[11px]` by integer, so PostCard's `text-[8.5px]` — the smallest text
  // in the product — survived both gates unseen. Decimals count.
  it("has no arbitrary text size below 12px", () => {
    const componentsDir = path.join(process.cwd(), "app/(public)/_components");
    const offenders: string[] = [];

    for (const name of fs.readdirSync(componentsDir)) {
      if (!name.endsWith(".tsx")) continue;
      const source = fs.readFileSync(path.join(componentsDir, name), "utf8");
      source.split("\n").forEach((line, index) => {
        for (const match of line.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)) {
          if (Number(match[1]) < 12) offenders.push(`${name}:${index + 1} ${match[0]}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});

describe("Table semantics (UI-A11Y-1, UI_AUDIT.md F26)", () => {
  it("gives TableHead a column scope by default", () => {
    render(
      <Table label="Test table">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Row</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute("scope", "col");
  });

  it("lets a caller override scope explicitly", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableHead scope="row">Row header</TableHead>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByRole("rowheader", { name: "Row header" })).toHaveAttribute("scope", "row");
  });
});

describe("Breadcrumb current-page semantics (UI-A11Y-1, UI_AUDIT.md F27)", () => {
  it("marks the current page with aria-current, not a fake disabled link", () => {
    render(<Breadcrumb items={[{ label: "Orders", href: "/orders" }, { label: "A Very Long Government Order Reference That Would Truncate" }]} />);
    const current = screen.getByText("A Very Long Government Order Reference That Would Truncate");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).not.toHaveAttribute("role", "link");
    expect(current).not.toHaveAttribute("aria-disabled");
  });

  it("exposes the full label via title when the current page truncates", () => {
    render(<Breadcrumb items={[{ label: "A Very Long Government Order Reference That Would Truncate" }]} />);
    const current = screen.getByText("A Very Long Government Order Reference That Would Truncate");
    expect(current).toHaveAttribute("title", "A Very Long Government Order Reference That Would Truncate");
  });
});
