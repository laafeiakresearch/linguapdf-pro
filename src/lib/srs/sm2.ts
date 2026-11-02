import { SrsState } from '@/types';

/**
 * SuperMemo 2 (SM-2) Spaced Repetition Algorithm
 * Grade scale:
 * 0 - Complete blackout
 * 1 - Incorrect; familiar upon seeing answer
 * 2 - Incorrect; seemed easy once seen
 * 3 - Correct with serious difficulty
 * 4 - Correct after hesitation
 * 5 - Perfect recall
 */
export function calculateSM2(
  currentState: SrsState = {
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now(),
  },
  grade: number // 0 - 5
): SrsState {
  let { repetitions, interval, easeFactor } = currentState;

  if (grade >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Failed recall: reset repetitions, review tomorrow
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  const nextReviewDate = Date.now() + interval * oneDayMs;

  return {
    repetitions,
    interval,
    easeFactor,
    nextReviewDate,
    lastReviewedDate: Date.now(),
  };
}

export function isDueForReview(srs: SrsState): boolean {
  if (!srs || !srs.nextReviewDate) return true;
  return srs.nextReviewDate <= Date.now();
}
