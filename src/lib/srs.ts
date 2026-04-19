import type { Rating, SRSState } from "./types";

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

export function createInitialSRSState(): SRSState {
  const now = new Date();
  return {
    easeFactor: DEFAULT_EASE,
    interval: 0,
    repetitions: 0,
    nextReview: now.toISOString(),
  };
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * SM-2 inspired spaced repetition. Rating maps to quality 0-5 style outcomes.
 */
export function calculateNextReview(
  prev: SRSState | undefined,
  rating: Rating,
  now: Date = new Date(),
): SRSState {
  const state = prev ?? createInitialSRSState();
  let { easeFactor, interval, repetitions } = state;

  const qualityMap: Record<Rating, number> = {
    again: 0,
    hard: 2,
    good: 4,
    easy: 5,
  };
  const q = qualityMap[rating];

  if (q < 3) {
    repetitions = 0;
    if (rating === "again") {
      interval = 0;
    } else {
      interval = Math.max(1, Math.round(interval * 0.5)) || 1;
    }
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor =
    easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < MIN_EASE) {
    easeFactor = MIN_EASE;
  }

  const next =
    rating === "again"
      ? addDays(now, 0)
      : addDays(now, Math.max(1, interval));

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview: next.toISOString(),
    lastReviewed: now.toISOString(),
  };
}

export function isDue(state: SRSState | undefined, now: Date = new Date()): boolean {
  if (!state) return true;
  return new Date(state.nextReview) <= now;
}
