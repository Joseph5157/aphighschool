// Minimal ambient declaration for react-dom/server. No @types/react-dom
// package is installed (and none should be added just for one test file) —
// this declares only the export test/category-links.test.ts actually uses.
declare module "react-dom/server" {
  import type { ReactNode } from "react";
  export function renderToStaticMarkup(element: ReactNode): string;
}
