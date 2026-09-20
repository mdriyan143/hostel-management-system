// Small shared helpers, ported from logic that was duplicated inline across
// the original js/*.js files (todayStr/toISODate, daysInMonth, meal weighting).

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonthStr(): string {
  return new Date().toISOString().slice(0, 7);
}

export function daysInMonth(monthStr: string): number {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

export interface MealFlags {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

// Breakfast counts as 0.5 of a meal, lunch and dinner each count as 1.
export function weightedMeals(flags: MealFlags): number {
  return (flags.breakfast ? 0.5 : 0) + (flags.lunch ? 1 : 0) + (flags.dinner ? 1 : 0);
}
