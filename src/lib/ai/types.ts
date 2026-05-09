export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface AIContext {
  habits: Array<{
    id: string;
    name: string;
    completed_today: boolean;
    streak_current: number;
  }>;
  topStreak: number;
  budgetSummary: any | null;
  workoutPlans: Array<{ name: string; focus: string }>;
  mealPlans: Array<{ name: string; meal_type: string }>;
}

export interface AIState {
  messages: Message[];
  isOpen: boolean;
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string | null;
}

export interface AIAction {
  type:
    | "add_habit"
    | "mark_habit_complete"
    | "log_workout"
    | "add_expense"
    | "add_meal"
    | "query"
    | "unknown";
  payload: Record<string, unknown>;
  response: string;
}

export interface VoiceRecognition {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  onResult: (callback: (transcript: string) => void) => void;
  onEnd: (callback: () => void) => void;
}
