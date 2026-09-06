export type EntryType = "spend" | "save";

export type CategoryId =
  | "food"
  | "transport"
  | "games"
  | "treats"
  | "home"
  | "other";

export interface Entry {
  id: string;
  type: EntryType;
  amount: number;
  category: CategoryId;
  note: string;
  date: string; // yyyy-mm-dd
}

export interface Settings {
  budget: number;
  goalName: string;
  goalAmount: number;
  currency: string;
}

export interface AppState {
  entries: Entry[];
  settings: Settings;
}

export type TabId = "dashboard" | "history" | "goals" | "insights";
