import { describe, expect, it } from "vitest";
import { calculateNextReview, createInitialSRSState, isDue } from "./srs";

describe("calculateNextReview", () => {
  it("schedules again soon for again rating", () => {
    const initial = createInitialSRSState();
    const fixed = new Date("2025-01-15T12:00:00.000Z");
    const next = calculateNextReview(initial, "again", fixed);
    expect(new Date(next.nextReview).getTime()).toBeLessThanOrEqual(
      fixed.getTime() + 86400000,
    );
  });

  it("increases interval on good rating", () => {
    let s = createInitialSRSState();
    const day = new Date("2025-01-15T12:00:00.000Z");
    s = calculateNextReview(s, "good", day);
    expect(s.interval).toBeGreaterThanOrEqual(1);
    expect(s.repetitions).toBeGreaterThan(0);
  });
});

describe("isDue", () => {
  it("returns true when no state", () => {
    expect(isDue(undefined)).toBe(true);
  });

  it("returns false when next review is in future", () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    expect(
      isDue({
        easeFactor: 2.5,
        interval: 7,
        repetitions: 1,
        nextReview: future.toISOString(),
      }),
    ).toBe(false);
  });
});
