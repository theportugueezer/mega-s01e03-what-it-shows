// One ticket per cause in a merged desk ticket. Causes come from causes.ts; this file only adds where
// each cause is tracked.
import { type Cause } from '#lib/kb/causes';

// Where each cause is tracked: one GitHub issue per cause.
export const ISSUE: Record<Cause, number> = { parser: 1, hint: 2 };

export const SUMMARY: Record<Cause, string> = {
  parser: 'The shared parser reads day-first dates month first: day and month swap.',
  hint: 'The booking-v3 form asks for MM/DD/YYYY, then reads the date day first.',
};
