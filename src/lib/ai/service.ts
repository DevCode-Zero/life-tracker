import type { AIContext } from "./types";

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

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

Current user data:
- Habits: ${JSON.stringify(context.habits)}
- Top Streak (best across all habits): ${context.topStreak} day(s)
- Budget: ${JSON.stringify(context.budgetSummary)}
- Workout Plans: ${JSON.stringify(context.workoutPlans)}
- Meal Plans: ${JSON.stringify(context.mealPlans)}

When asked about your streak, report the Top Streak (e.g. "Your best streak is 3 days! 🔥").

IMPORTANT: When the user asks you to DO something, you MUST respond with ONLY a JSON object in this exact format:
{"action": "add_habit", "payload": {"name": "Drink water", "frequency": "daily", "emoji": "💧"}, "response": "💧 I've added a habit to drink water daily!"}

Valid actions: "add_habit", "log_workout_by_name", "add_expense", "add_income", "add_meal", "query", "unknown"

For "add_habit": payload needs "name" (required), "frequency" (optional, "daily" or "weekly"), "emoji" (optional, suggest a relevant emoji based on the habit name e.g. 💧 for water, 🍽️ for eating, 💪 for workout, 📚 for reading)
For "log_workout_by_name": payload needs "name" (the type of workout)
For "add_expense"/"add_income": payload needs "amount" (number), "category" (optional)
For "add_meal": payload needs "meal_type" and "name"

If just answering a question, use action "query" and put your answer in "response".

User says: "${userInput}"

Respond with ONLY the JSON object:`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000",
        "X-Title": "Life Tracker AI",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "user", content: fullPrompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      // Retry logic for rate limits
      if (response.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        return sendMessage(messages, context, retryCount + 1);
      }

      throw new Error(`API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;

    try {
      const parsed = JSON.parse(jsonString);
      return {
        action: parsed.action || "query",
        payload: parsed.payload || {},
        response: parsed.response || content,
      };
    } catch {
      // If JSON parsing fails, try local fallback
      const fallback = localFallback(userInput);
      if (fallback) return fallback;

      return {
        action: "query",
        payload: {},
        response: content || "I'm not sure how to help with that.",
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
