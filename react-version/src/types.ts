// Domain types for the Hostel & Mess Management System.
// These mirror the plain-object shapes the original vanilla-JS app stored
// in localStorage, now with explicit interfaces instead of untyped objects.

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  roomId: string | null;
  contact: string;
  guardianContact: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  rent: number;
}

export interface AttendanceRecord {
  id: string;
  key: string; // `${date}_${studentId}`
  studentId: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface GroceryEntry {
  id: string;
  studentId: string;
  amount: number;
  note: string;
  month: string;
}

export interface ManagerGroceryEntry {
  id: string;
  amount: number;
  note: string;
  month: string;
}

export interface Deposit {
  id: string;
  studentId: string;
  amount: number;
  month: string;
}

export interface BibidhEntry {
  id: string;
  description: string;
  amount: number;
  month: string;
}

export interface UtilityEntry {
  id: string;
  category: 'Water' | 'Gas' | 'Electricity' | 'Cooking';
  amount: number;
  note: string;
  month: string;
}

export interface SettlementRow {
  name: string;
  meals: number;
  mealCost: number;
  bibidhShare: number;
  finalCost: number;
  contribution: number;
  balance: number;
}

export interface Settlement {
  id: string;
  key: string; // month
  month: string;
  totalGrocery: number;
  totalPersonalGrocery: number;
  totalManagerGrocery: number;
  totalDeposits: number;
  totalBibidh: number;
  totalMeals: number;
  mealRate: number;
  bibidhShare: number;
  rows: SettlementRow[];
}

// Names of every localStorage-backed collection (kept identical to the
// original app so existing browser data continues to work unchanged).
export type CollectionName =
  | 'students'
  | 'rooms'
  | 'attendance'
  | 'groceryEntries'
  | 'managerGroceryEntries'
  | 'deposits'
  | 'bibidhEntries'
  | 'utilityEntries'
  | 'settlements';
