import { PromotionPlan } from "../types";

const STORAGE_KEY = "nearbykaam_promotion_plans";

const DEFAULT_PLANS: PromotionPlan[] = [
  { id: "5km", radiusKm: 5, price: 199, isActive: true },
  { id: "10km", radiusKm: 10, price: 299, isActive: true },
  { id: "20km", radiusKm: 20, price: 399, popular: true, isActive: true },
  { id: "30km", radiusKm: 30, price: 499, isActive: true },
];

/* ---------- GET ---------- */
export function getPromotionPlans(): PromotionPlan[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLANS));
    return DEFAULT_PLANS;
  }
  return JSON.parse(stored);
}

/* ---------- SAVE ---------- */
export function savePromotionPlans(plans: PromotionPlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

/* ---------- ADD ---------- */
export function addPromotionPlan(
  plans: PromotionPlan[],
  newPlan: PromotionPlan,
): PromotionPlan[] {
  if (plans.some((p) => p.radiusKm === newPlan.radiusKm)) {
    throw new Error("Duplicate radius not allowed");
  }

  // Only one popular plan
  const normalizedPlans = newPlan.popular
    ? plans.map((p) => ({ ...p, popular: false }))
    : plans;

  // At least one active plan must exist
  if (!normalizedPlans.some((p) => p.isActive) && !newPlan.isActive) {
    throw new Error("At least one plan must remain active");
  }

  return [...normalizedPlans, newPlan];
}
