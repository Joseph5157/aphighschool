// @vitest-environment node
// TERM-TOPICS-1 found the /search topic chip bar silently missing in
// production: the server page imported FEATURED_TOPICS (an array) from a
// "use client" module. In a production build such a value reaches server code
// only as a client reference, so `.map()` threw and optionalQuery hid the
// failure. Vitest renders without that boundary, so no render test caught it.
// This guard fails when any server module imports a constant-style named
// export (ALL_CAPS) from a "use client" module under app/.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// No known exceptions: the last one (MIN_TOC_HEADINGS) moved to lib/posts/toc.ts.
const KNOWN_EXCEPTIONS = new Set<string>();

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.(tsx?|jsx?)$/.test(e.name) ? [full] : [];
  });
}

const isClient = (src: string) => /^\s*["']use client["']/.test(src);

function resolve(spec: string, from: string): string | null {
  const base = spec.startsWith("@/") ? path.join(ROOT, spec.slice(2)) : spec.startsWith(".") ? path.resolve(path.dirname(from), spec) : null;
  if (!base) return null;
  for (const ext of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    if (fs.existsSync(base + ext) && fs.statSync(base + ext).isFile()) return base + ext;
  }
  return null;
}

describe("server modules never read data exported from a client module", () => {
  it("finds no ALL_CAPS named import from a \"use client\" file in a server file", () => {
    const offences: string[] = [];
    for (const file of walk(path.join(ROOT, "app"))) {
      const src = fs.readFileSync(file, "utf8");
      if (isClient(src)) continue;
      for (const m of src.matchAll(/import\s+(?:[\w$]+\s*,\s*)?\{([^}]+)\}\s*from\s*["']([^"']+)["']/g)) {
        const target = resolve(m[2], file);
        if (!target || !isClient(fs.readFileSync(target, "utf8"))) continue;
        for (const name of m[1].split(",").map((n) => n.trim().split(/\s+as\s+/)[0].replace(/^type\s+/, ""))) {
          const offence = `${path.relative(ROOT, file).split(path.sep).join("/")} imports ${name} from ${m[2]}`;
          if (/^[A-Z][A-Z0-9_]+$/.test(name) && !KNOWN_EXCEPTIONS.has(offence)) offences.push(offence);
        }
      }
    }
    expect(offences).toEqual([]);
  });
});
