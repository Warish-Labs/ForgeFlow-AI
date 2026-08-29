// tests/setup.ts — minimal vitest setup for Next.js + React
import "@testing-library/jest-dom";
import path from "path";
import { createRequire } from "module";

// Polyfill for undici/jsdom compatibility issue in CI (webidl.util.markAsUncloneable)
try {
  const req = createRequire(import.meta.url);
  const undiciDir = path.dirname(req.resolve("undici"));
  const webidl = req(path.join(undiciDir, "lib/web/fetch/webidl.js")) as {
    util?: { markAsUncloneable?: (obj: unknown) => unknown };
  };
  if (webidl && webidl.util && typeof webidl.util.markAsUncloneable !== "function") {
    webidl.util.markAsUncloneable = (obj: unknown) => obj;
  }
} catch {
  // Ignore polyfill errors
}
