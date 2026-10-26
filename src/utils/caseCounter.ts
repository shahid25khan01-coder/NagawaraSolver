import { Complaint } from '../types.ts';

export interface NextCaseInfo {
  caseNumber: number;
  id: string;
  month: number;
  year: number;
  isFirstMonth: boolean;
  cycleKey: string;
  cycleDescription: string;
}

/**
 * Case Counting Logic for NagawaraSolver (Ward-22):
 * 1. Case counting starts from 1 (e.g. CP-1, Case #1).
 * 2. It restarts from 1 in the 1st month:
 *    - In the 1st month of the year (January, month === 1 / getMonth() === 0),
 *      the case counter restarts from 1 for the new annual cycle.
 *    - In any month, case numbers increment sequentially: 1, 2, 3...
 *    - If monthly mode is chosen or simulated, it restarts from 1 on each 1st month.
 */
export function getNextCaseDetails(
  existingComplaints: Complaint[] = [],
  targetDate: Date = new Date(),
  mode: 'first_month_annual' | 'monthly' = 'first_month_annual'
): NextCaseInfo {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1; // 1 = January (the 1st month), 10 = October, etc.
  const isFirstMonth = month === 1;

  // Define cycle key
  // In first_month_annual mode: cycle resets every January (1st month) of each year.
  // In monthly mode: cycle resets on every month.
  const cycleKey = mode === 'monthly' ? `${year}-${String(month).padStart(2, '0')}` : `${year}`;

  // Filter complaints that belong to the current active counting cycle
  const currentCycleComplaints = existingComplaints.filter(c => {
    if (!c.createdAt) return false;
    const cDate = new Date(c.createdAt);
    if (isNaN(cDate.getTime())) return false;

    const cYear = cDate.getFullYear();
    const cMonth = cDate.getMonth() + 1;

    if (mode === 'monthly') {
      return cYear === year && cMonth === month;
    }

    // In first_month_annual mode:
    // If we are currently in January (the 1st month), only count complaints created in January of this year.
    // Complaints from previous years/months are outside this cycle, so counting restarts from 1!
    if (isFirstMonth) {
      return cYear === year && cMonth === 1;
    }

    // If we are in months 2..12 of this year, count complaints created in this calendar year
    return cYear === year;
  });

  // Extract all valid sequential case numbers from complaints in this cycle
  const caseNumbers: number[] = [];

  for (const c of currentCycleComplaints) {
    if (typeof c.caseNumber === 'number' && c.caseNumber > 0 && c.caseNumber < 100000) {
      caseNumbers.push(c.caseNumber);
      continue;
    }

    // Check if ID is in CP-X or CASE-X format
    const match = c.id.match(/^(?:CP|CASE)[-_]?(\d+)$/i);
    if (match) {
      const parsed = parseInt(match[1], 10);
      // Ignore legacy random 4-digit numbers (e.g. 8492, 8504) that were randomly generated
      if (parsed > 0 && parsed < 1000) {
        caseNumbers.push(parsed);
      }
    }
  }

  // Find max case number in the active period
  const maxCase = caseNumbers.length > 0 ? Math.max(...caseNumbers) : 0;
  const nextCaseNumber = maxCase + 1;

  const cycleDescription = isFirstMonth
    ? `1st Month (January ${year}) - Restarted from 1`
    : `Ward-22 Active Cycle (${year}) - Case #${nextCaseNumber}`;

  return {
    caseNumber: nextCaseNumber,
    id: `CP-${nextCaseNumber}`,
    month,
    year,
    isFirstMonth,
    cycleKey,
    cycleDescription,
  };
}

/**
 * Flexible ticket matching:
 * Matches "1", "#1", "Case 1", "Case-1", "CP-1", "CP-001" or full ID.
 */
export function matchesTicketQuery(c: Complaint, rawQuery: string): boolean {
  if (!rawQuery) return false;
  const q = rawQuery.trim().toUpperCase();

  // 1. Exact or case-insensitive ID match
  if (c.id.toUpperCase() === q) return true;

  // 2. Normalize query: strip '#', 'CASE', 'CASE-', 'CP', 'CP-'
  const cleanNumStr = q
    .replace(/^#/, '')
    .replace(/^CASE[- _]?/i, '')
    .replace(/^CP[- _]?/i, '')
    .trim();

  const queryNum = parseInt(cleanNumStr, 10);

  if (!isNaN(queryNum) && queryNum > 0) {
    // Check against complaint caseNumber
    if (c.caseNumber === queryNum) return true;

    // Check if complaint ID ends with this number (e.g. CP-1 matches query 1)
    const idMatch = c.id.match(/^(?:CP|CASE)[-_]?(\d+)$/i);
    if (idMatch && parseInt(idMatch[1], 10) === queryNum) {
      return true;
    }
  }

  // 3. Match against title or citizen name
  if (c.title && c.title.toUpperCase().includes(q)) return true;
  if (c.citizenName && c.citizenName.toUpperCase().includes(q)) return true;
  if (c.location?.address && c.location.address.toUpperCase().includes(q)) return true;

  return false;
}
