import { describe, expect, test } from "bun:test";
import { shouldShowDemoTour } from "../src/lib/demo-tour";

describe("demo-only first-visit tour", () => {
  test("shows on the demo account's first visit", () => {
    expect(shouldShowDemoTour("demo@lucromais.com", null)).toBe(true);
  });
  test("never shows for another account or signed-out visitor", () => {
    expect(shouldShowDemoTour("visitor@example.com", null)).toBe(false);
    expect(shouldShowDemoTour(undefined, null)).toBe(false);
  });
  test("does not repeat after completion or skipping", () => {
    expect(shouldShowDemoTour("demo@lucromais.com", "true")).toBe(false);
  });
});