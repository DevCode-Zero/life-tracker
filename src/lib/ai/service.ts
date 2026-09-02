import type { AIContext } from "./types";

export interface AIResponse {
  action: string;
  payload: Record<string, unknown>;
  response: string;
}

export function suggestEmoji(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(water|drink|hydrate|tea|coffee|juice)\b/.test(lower)) return "💧";
  if (
    /\b(eat|dinner|lunch|breakfast|meal|cook|food|fruit|vegetable|veggie|salad)\b/.test(
      lower,
    )
  )
    return "🍽️";
  if (/\b(apple|fruit)\b/.test(lower)) return "🍎";
  if (/\b(gym|workout|exercise|strength|push.?up|pull.?up|squat)\b/.test(lower))
    return "💪";
  if (/\b(run|jog|walk|cardio|run)\b/.test(lower)) return "🏃";
  if (/\b(yoga|stretch|meditate|meditation|breathe|breath)\b/.test(lower))
    return "🧘";
  if (/\b(read|book|study|learn|journal|write)\b/.test(lower)) return "📚";
  if (/\b(code|program|developer|project)\b/.test(lower)) return "💻";
  if (/\b(save|money|budget|finance|invest|sip)\b/.test(lower)) return "💰";
  if (/\b(sleep|bed|rest|nap)\b/.test(lower)) return "😴";
  if (/\b(bike|cycle|swim)\b/.test(lower)) return "🚴";
  if (/\b(music|piano|guitar|instrument|sing|song)\b/.test(lower)) return "🎵";
  if (/\b(call|phone|family|friend|parent|mom|dad)\b/.test(lower)) return "📞";
  if (/\b(clean|tidy|organize|laundry|dish)\b/.test(lower)) return "🧹";
  if (/\b(shower|bath|brush|floss|skincare|groom)\b/.test(lower)) return "🧴";
  if (/\b(pill|vitamin|supplement|medicine)\b/.test(lower)) return "💊";
  if (/\b(pet|dog|cat|walk\s+dog)\b/.test(lower)) return "🐾";
  return "✅";
}

// Local fallback for basic commands when API is unavailable
function localFallback(input: string): AIResponse | null {
  const lower = input.toLowerCase();

  // Add habit patterns
  if (lower.includes("add") && lower.includes("habit")) {
    const nameMatch = input.match(
      /habit\s+(?:to\s+)?(.+?)(?:\s+daily|\s+weekly|$)/i,
    );
    const name = nameMatch
      ? nameMatch[1].trim()
      : input.replace(/add\s+(?:a\s+)?habit\s+(?:to\s+)?/i, "").trim();
    const emoji = suggestEmoji(name);
    return {
      action: "add_habit",
      payload: {
        name: name || "New Habit",
        frequency: lower.includes("weekly") ? "weekly" : "daily",
        emoji,
      },
      response: `${emoji} I've added a habit to ${(name || "New Habit").toLowerCase()} ${lower.includes("weekly") ? "weekly" : "daily"}!`,
    };
  }

  // Mark habit complete patterns
  if (
    (lower.includes("mark") ||
      lower.includes("complete") ||
      lower.includes("done")) &&
    !lower.includes("add")
  ) {
    const habitMatch = input.match(
      /(?:mark|complete|done|log)\s+(?:completed\s+)?(?:for\s+)?(?:my\s+)?(.+)/i,
    );
    if (habitMatch) {
      const name = habitMatch[1].trim();
      return {
        action: "mark_habit_complete",
        payload: { name },
        response: `${suggestEmoji(name)} I've marked "${name}" as complete!`,
      };
    }
  }

  // Log workout patterns
  if (
    lower.includes("log") &&
    (lower.includes("workout") ||
      lower.includes("run") ||
      lower.includes("exercise"))
  ) {
    const typeMatch = input.match(/(run|jog|walk|bike|swim|gym|workout)/i);
    return {
      action: "log_workout_by_name",
      payload: { name: typeMatch ? typeMatch[1] : "workout" },
      response: `I've logged your ${typeMatch ? typeMatch[1] : "workout"} session!`,
    };
  }

  // Add expense patterns
  if (
    lower.includes("add") &&
    (lower.includes("expense") ||
      lower.includes("spent") ||
      lower.includes("paid"))
  ) {
    const amountMatch = input.match(/(\d+(?:\.\d{2})?)/);
    return {
      action: "add_expense",
      payload: {
        amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
        category: "general",
      },
      response: amountMatch
        ? `I've added an expense of $${amountMatch[1]}`
        : "Please specify the amount for the expense.",
    };
  }

  return null;
}

export async function sendMessage(
  messages: Array<{ role: string; content: string }>,
  context: AIContext,
  retryCount = 0,
): Promise<AIResponse> {
  try {
    const userInput = messages[messages.length - 1]?.content || "";

    const fullPrompt = `You are LifeTracker AI, a helpful assistant for a life tracking app. You help users with:
- Habits (add/view habits)
- Budget (add transactions/view budget)
- Workouts (log workouts/view plans)
- Nutrition (log meals/view plans)
- General advice on health, fitness, nutrition, productivity, and life

Current user data:
- Habits: ${JSON.stringify(context.habits)}
- Top Streak (best across all habits): ${context.topStreak} day(s)
- Budget: ${JSON.stringify(context.budgetSummary)}
- Workout Plans: ${JSON.stringify(context.workoutPlans)}
- Meal Plans: ${JSON.stringify(context.mealPlans)}

When asked about your streak, report the Top Streak (e.g. "Your best streak is 3 days! 🔥").

RULES:
1. You MUST respond with ONLY a JSON object, nothing else.
2. When the user asks you to DO something (add a habit, log a meal, log a workout, add an expense/income), use the matching action.
3. When the user asks a question, wants advice, or asks for a plan/routine, use action "query" and put your helpful answer in the "response" field.

Valid actions: "add_habit", "mark_habit_complete", "log_workout_by_name", "add_expense", "add_income", "add_meal", "query", "unknown"

Action payloads:
- "add_habit": {"name": "...", "frequency": "daily"|"weekly", "emoji": "..."}
- "mark_habit_complete": {"name": "habit name"}
- "log_workout_by_name": {"name": "workout type"}
- "add_expense": {"amount": number, "category": "..."}
- "add_income": {"amount": number, "category": "..."}
- "add_meal": {"meal_type": "...", "name": "..."}
- "query": {} (put your answer in "response")
- "unknown": {} (when you don't understand)

User says: "${userInput}"

Respond with ONLY the JSON object. In the "response" field, write plain text only — no markdown, no bold (**), no headers. Use actual line breaks (\n) for new lines. Keep it clean and easy to read.`;

    const apiResponse = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: fullPrompt }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));

      if (apiResponse.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return sendMessage(messages, context, retryCount + 1);
      }

      throw new Error(
        errorData.error || `API error: ${apiResponse.status}`,
      );
    }

    const { content } = await apiResponse.json();

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;

    try {
      const parsed = JSON.parse(jsonString);
      const rawResponse = parsed.response || content;
      const cleanResponse = rawResponse
        .replace(/\\n/g, "\n")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/^#{1,3}\s+/gm, "");
      return {
        action: parsed.action || "query",
        payload: parsed.payload || {},
        response: cleanResponse,
      };
    } catch {
      // If JSON parsing fails, try local fallback
      const fallback = localFallback(userInput);
      if (fallback) return fallback;

      const cleanContent = content
        .replace(/\\n/g, "\n")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/^#{1,3}\s+/gm, "")
        .replace(/^\s*```[\s\S]*?\n/gm, "")
        .replace(/\n\s*```\s*$/gm, "");

      return {
        action: "query",
        payload: {},
        response: cleanContent || "I'm not sure how to help with that.",
      };
    }
  } catch (error) {
    console.error("AI Service Error:", error);

    // Try local fallback on error
    const userInput = messages[messages.length - 1]?.content || "";
    const fallback = localFallback(userInput);
    if (fallback) return fallback;

    throw error;
  }
}
