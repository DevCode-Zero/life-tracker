import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Message, AIState } from "@/lib/ai/types";
import { sendMessage, suggestEmoji } from "@/lib/ai/service";
import { useStore } from "./index";
import { getHabitsWithLogs } from "@/lib/habits";
import { getMonthlyBudgetSummary } from "@/lib/budget";
import { getWorkoutPlans } from "@/lib/workout";
import { getMealPlans } from "@/lib/nutrition";
import type { AIContext } from "@/lib/ai/types";

type SetState = (
  partial: Partial<AIStore> | ((state: AIStore) => Partial<AIStore>),
  replace?: boolean,
) => void;
type GetState = () => AIStore;

interface AIStore extends AIState {
  toggleOpen: () => void;
  close: () => void;
  addMessage: (role: "user" | "assistant", content: string) => void;
  setListening: (listening: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setTranscript: (transcript: string) => void;
  setError: (error: string | null) => void;
  processUserInput: (input: string) => Promise<void>;
  clearMessages: () => void;
}

export const useAIStore = create<AIStore>()(
  devtools(
    (set: SetState, get: GetState) => ({
      messages: [
        {
          id: "1",
          role: "assistant" as const,
          content:
            "Hi! I'm your LifeTracker AI assistant. I can help with habits, budget, workouts, and nutrition. Try: 'Add a habit to drink water daily' or 'What's my budget?'",
          timestamp: new Date(),
        },
      ],
      isOpen: false,
      isListening: false,
      isProcessing: false,
      transcript: "",
      error: null,

      toggleOpen: () => set((state: AIStore) => ({ isOpen: !state.isOpen })),
      close: () => set({ isOpen: false, isListening: false }),

      addMessage: (role: "user" | "assistant", content: string) =>
        set((state: AIStore) => ({
          messages: [
            ...state.messages,
            {
              id: Date.now().toString(),
              role,
              content,
              timestamp: new Date(),
            },
          ],
        })),

      setListening: (isListening: boolean) => set({ isListening }),
      setProcessing: (isProcessing: boolean) => set({ isProcessing }),
      setTranscript: (transcript: string) => set({ transcript }),
      setError: (error: string | null) => set({ error }),

      clearMessages: () =>
        set({
          messages: [
            {
              id: "1",
              role: "assistant" as const,
              content:
                "Hi! I'm your LifeTracker AI assistant. I can help you track habits, budget, workouts, and nutrition. Just click the microphone and speak!",
              timestamp: new Date(),
            },
          ],
        }),

      processUserInput: async (input: string) => {
        const { addMessage, setProcessing, setError } = get();

        addMessage("user", input);
        setProcessing(true);
        setError(null);

        try {
          const mainStore = useStore.getState();
          const userId = mainStore.user?.id;

          let context: AIContext = {
            habits: [],
            topStreak: 0,
            budgetSummary: null,
            workoutPlans: [],
            mealPlans: [],
          };

          if (userId) {
            const [habits, budgetSummary, workoutPlans, mealPlans] =
              await Promise.all([
                getHabitsWithLogs(userId).catch(() => []),
                getMonthlyBudgetSummary(userId).catch(() => null),
                getWorkoutPlans(userId).catch(() => []),
                getMealPlans(userId).catch(() => []),
              ]);

            context = {
              habits: habits.map((h) => ({
                id: h.id,
                name: h.name,
                completed_today: h.completed_today,
                streak_current: h.streak_current,
              })),
              topStreak: habits.reduce(
                (max, h) => Math.max(max, h.streak_current),
                0,
              ),
              budgetSummary,
              workoutPlans: workoutPlans.map((w) => ({
                name: w.name,
                focus: w.focus,
              })),
              mealPlans: mealPlans.map((m) => ({
                name: m.name,
                meal_type: m.meal_type,
              })),
            };
          }

          const response = await sendMessage(
            [{ role: "user" as const, content: input }],
            context,
          );

          addMessage("assistant", response.response);

          // Execute action if not a query
          if (
            response.action &&
            response.action !== "query" &&
            response.action !== "unknown"
          ) {
            await executeAction(response.action, response.payload, userId);
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to process request";
          setError(message);
          addMessage("assistant", `Sorry, I encountered an error: ${message}`);
        } finally {
          setProcessing(false);
        }
      },
    }),
    { name: "life-tracker-ai-store" },
  ),
);

// ── Action Execution ────────────────────────────────────
async function executeAction(
  action: string,
  payload: Record<string, unknown>,
  userId: string | undefined,
) {
  if (!userId) return;

  const store = useStore.getState();

  try {
    switch (action) {
      case "add_habit":
        if (payload.name) {
          const { createHabit } = await import("@/lib/habits");
          const name = payload.name as string;
          await createHabit(userId, {
            name,
            frequency: "daily" as const,
            emoji: (payload.emoji as string) || suggestEmoji(name),
            category: "health" as const,
            target_days: [0, 1, 2, 3, 4, 5, 6],
          });
          const { getHabitsWithLogs } = await import("@/lib/habits");
          const habits = await getHabitsWithLogs(userId);
          store.setHabits(habits);
        }
        break;

      case "log_workout":
      case "log_workout_by_name":
        if (payload.type || payload.name) {
          const { getWorkoutPlans, logWorkout } = await import("@/lib/workout");
          const plans = await getWorkoutPlans(userId);
          const plan = plans.find(
            (p: any) =>
              p.name
                .toLowerCase()
                .includes(
                  (
                    (payload.type as string) ||
                    (payload.name as string) ||
                    ""
                  ).toLowerCase(),
                ) ||
              ((payload.type as string) || (payload.name as string) || "")
                .toLowerCase()
                .includes(p.name.toLowerCase()),
          );
          if (plan) {
            await logWorkout(userId, plan.id);
          }
        }
        break;

      case "add_expense":
      case "add_income":
        if (payload.amount) {
          const { createTransaction } = await import("@/lib/budget");
          await createTransaction(userId, {
            type: action === "add_income" ? "income" : "expense",
            amount: payload.amount as number,
            category: "other" as const,
            name:
              (payload.description as string) ||
              (payload.name as string) ||
              "Transaction",
            date: new Date().toISOString().split("T")[0] as string,
          });
          const { getMonthlyBudgetSummary } = await import("@/lib/budget");
          const summary = await getMonthlyBudgetSummary(userId);
          store.setBudgetSummary(summary);
        }
        break;

      case "add_meal":
      case "log_meal":
        if (payload.meal_type || payload.name) {
          const { getMealPlans, logMeal } = await import("@/lib/nutrition");
          const plans = await getMealPlans(userId);
          const plan = plans.find(
            (p: any) =>
              p.meal_type === (payload.meal_type as string) ||
              p.name
                .toLowerCase()
                .includes(((payload.name as string) || "").toLowerCase()),
          );
          if (plan) {
            await logMeal(userId, plan.id);
          }
        }
        break;
    }
  } catch (error) {
    console.error("Action execution error:", error);
  }
}
