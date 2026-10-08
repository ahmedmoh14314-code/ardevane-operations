import { describe, expect, it } from "vitest";
import { nextRequestStep, requestStatusLabel, requestTotal } from "./requests";

describe("requestStatusLabel", () => {
  it("words one lifecycle to fit each kind of request", () => {
    expect(requestStatusLabel("dining", "in_progress")).toBe("Preparing");
    expect(requestStatusLabel("dining", "completed")).toBe("Delivered");
    expect(requestStatusLabel("support", "completed")).toBe("Resolved");
    expect(requestStatusLabel("maintenance", "completed")).toBe("Fixed");
    expect(requestStatusLabel("housekeeping", "new")).toBe("New");
  });
});

describe("nextRequestStep", () => {
  it("moves new → in progress → completed, then stops", () => {
    expect(nextRequestStep("dining", "new")).toEqual({
      to: "in_progress",
      label: "Start preparing",
    });
    expect(nextRequestStep("maintenance", "in_progress")).toEqual({
      to: "completed",
      label: "Mark fixed",
    });
    expect(nextRequestStep("support", "completed")).toBe(null);
  });
});

describe("requestTotal", () => {
  it("adds up a food order", () => {
    expect(
      requestTotal([
        { unitPrice: 8, quantity: 2 },
        { unitPrice: 3, quantity: 1 },
      ]),
    ).toBe(19);
    expect(requestTotal([])).toBe(0);
  });
});
