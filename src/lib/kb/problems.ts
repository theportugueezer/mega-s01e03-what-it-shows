// What a report shows, not only where its tenant points. causes.ts sorts by tenant and channel;
// a report that describes a one-day move (desk-notes.json) is a different problem, whatever its tenant.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';

// Where each problem is tracked: one GitHub issue per problem.
export const ISSUE: Record<Problem, number> = { parser: 1, hint: 2, 'one-day': 3 };

export const SUMMARY: Record<Problem, string> = {
  parser: 'The shared parser reads day-first dates month first: day and month swap.',
  hint: 'The booking-v3 form asks for MM/DD/YYYY, then reads the date day first.',
  'one-day': 'The date moves one day earlier, across time zones. No swap.',
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | 'unplaced' {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = { problem: Problem | 'unplaced'; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function groupByProblem(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const byProblem = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  return [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
