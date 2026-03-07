import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type {
  User, HabitWithLogs, MonthlyBudgetSummary,
  WorkoutLog, DailyNutritionSummary, DashboardStats
} from '@/types'

// ── Types ─────────────────────────────────────────────────────
interface AppState {
  // Auth
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void

  // Habits
  habits: HabitWithLogs[]
  setHabits: (habits: HabitWithLogs[]) => void
  updateHabitCompletion: (habitId: string, completed: boolean) => void

  // Budget
  budgetSummary: MonthlyBudgetSummary | null
  setBudgetSummary: (summary: MonthlyBudgetSummary) => void

  // Workout
  recentWorkouts: WorkoutLog[]
  setRecentWorkouts: (workouts: WorkoutLog[]) => void

  // Nutrition
  todayNutrition: DailyNutritionSummary | null
  setTodayNutrition: (nutrition: DailyNutritionSummary) => void

  // Dashboard
  dashboardStats: DashboardStats | null
  setDashboardStats: (stats: DashboardStats) => void

  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void

  // Reset
  reset: () => void
}

const initialState = {
  user: null,
  isLoading: true,
  habits: [],
  budgetSummary: null,
  recentWorkouts: [],
  todayNutrition: null,
  dashboardStats: null,
  sidebarOpen: true,
  activeTab: 'overview',
}

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setUser: (user) => set({ user }),
        setLoading: (isLoading) => set({ isLoading }),

        setHabits: (habits) => set({ habits }),
        updateHabitCompletion: (habitId, completed) =>
          set((state) => ({
            habits: state.habits.map((h) =>
              h.id === habitId ? { ...h, completed_today: completed } : h
            ),
          })),

        setBudgetSummary: (budgetSummary) => set({ budgetSummary }),
        setRecentWorkouts: (recentWorkouts) => set({ recentWorkouts }),
        setTodayNutrition: (todayNutrition) => set({ todayNutrition }),
        setDashboardStats: (dashboardStats) => set({ dashboardStats }),

        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        setActiveTab: (activeTab) => set({ activeTab }),

        reset: () => set(initialState),
      }),
      {
        name: 'life-tracker-store',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          activeTab: state.activeTab,
        }),
      }
    )
  )
)

// ── Selectors ─────────────────────────────────────────────────
export const selectHabitsCompletedToday = (state: AppState) =>
  state.habits.filter((h) => h.completed_today).length

export const selectHabitScore = (state: AppState) => {
  if (state.habits.length === 0) return 0
  return Math.round(
    (state.habits.filter((h) => h.completed_today).length / state.habits.length) * 100
  )
}

export const selectCurrentStreak = (state: AppState) =>
  state.habits.reduce((max, h) => Math.max(max, h.streak_current), 0)
