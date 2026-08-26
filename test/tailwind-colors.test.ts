// @vitest-environment node
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import tailwindcss from "tailwindcss";

const TOKEN_NAMES = [
  "ink",
  "inkSoft",
  "turmeric",
  "turmericDeep",
  "tamarind",
  "tamarindDark",
  "kumkum",
  "paper",
  "paperRaised",
  "hair",
] as const;

function declarationsIn(block: string): Map<string, string> {
  return new Map(
    [...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].trim(),
    ]),
  );
}

function hexAsTriplet(hex: string): string {
  return [1, 3, 5]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16))
    .join(" ");
}

describe("Tailwind colour-token opacity modifiers", () => {
  it("emits real CSS for representative background, text, and border utilities", async () => {
    const result = await postcss([
      tailwindcss(path.join(process.cwd(), "tailwind.config.js")),
    ]).process("@tailwind utilities;", { from: undefined });

    const declarations = new Map<string, string>();
    result.root.walkRules((rule) => {
      rule.walkDecls((declaration) => {
        declarations.set(`${rule.selector}|${declaration.prop}`, declaration.value);
      });
    });

    expect(declarations.get(".text-inkSoft\\/70|color")).toBe(
      "rgb(var(--rgb-inkSoft) / 0.7)",
    );
    expect(declarations.get(".bg-tamarind\\/10|background-color")).toBe(
      "rgb(var(--rgb-tamarind) / 0.1)",
    );
    expect(declarations.get(".bg-turmeric\\/20|background-color")).toBe(
      "rgb(var(--rgb-turmeric) / 0.2)",
    );
    expect(declarations.get(".border-hair\\/60|border-color")).toBe(
      "rgb(var(--rgb-hair) / 0.6)",
    );
  });

  it("keeps the hex tokens and their RGB mirrors synchronized in both themes", () => {
    const css = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
    const lightBlock = [...css.matchAll(/:root\s*{([\s\S]*?)\n}/g)].find((match) =>
      match[1].includes("--color-ink"),
    )?.[1];
    const light = declarationsIn(lightBlock ?? "");
    const dark = declarationsIn(css.match(/html\.dark\s*{([\s\S]*?)\n}/)?.[1] ?? "");

    for (const theme of [light, dark]) {
      for (const token of TOKEN_NAMES) {
        expect(theme.get(`rgb-${token}`), `${token} RGB mirror`).toBe(
          hexAsTriplet(theme.get(`color-${token}`) ?? ""),
        );
      }
    }

    expect(light.get("rgb-masthead")).toBe(hexAsTriplet(light.get("color-masthead") ?? ""));
    expect(light.get("rgb-mastheadText")).toBe(
      hexAsTriplet(light.get("color-masthead-text") ?? ""),
    );
  });
});
