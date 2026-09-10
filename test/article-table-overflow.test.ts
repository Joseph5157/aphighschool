// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const css = readFileSync("app/globals.css", "utf8");
const tableRule = css.match(/\.prose-gazette table\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
const proseRules = [...css.matchAll(/\.prose-gazette\s*\{([\s\S]*?)\n\}/g)];
const containmentRule = proseRules.at(-1)?.[1] ?? "";

describe("long document tables", () => {
  it("keeps their horizontal scrolling local instead of letting a shorthand hide it", () => {
    expect(tableRule).toMatch(/overflow-x:\s*auto;/);
    expect(tableRule).toMatch(/overflow-y:\s*hidden;/);
    expect(tableRule).not.toMatch(/overflow:\s*hidden;/);
    expect(containmentRule).toMatch(/overflow-x:\s*clip;/);
  });
});
