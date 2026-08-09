export const PLANS = {
  free: { label: "Free", monthlyTokenLimit: 100 },
  pro: { label: "Pro", monthlyTokenLimit: 500000 }
} as const;

export const PLAN_MODELS = {
  free: "openai/gpt-5-nano",
  pro: "openai/gpt-5.6-luna"
} as const;

export const PLAN_IMAGE_MODELS = {
  free: "gpt-image-1-mini",
  pro: "gpt-image-2"
} as const;

export type Plan = keyof typeof PLANS;

export function getMonthlyTokenLimit(plan: Plan): number {
  return PLANS[plan].monthlyTokenLimit;
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
