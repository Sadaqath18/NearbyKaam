import { PromotionPlan } from "../types";

const STORAGE_KEY = "nearbykaam_promotion_plans";

const DEFAULT_PLANS: PromotionPlan[] = [
  { id: "5km", radiusKm: 5, price: 199, isActive: true },
  { id: "10km", radiusKm: 10, price: 299, isActive: true },
  { id: "20km", radiusKm: 20, price: 399, popular: true, isActive: true },
  { id: "30km", radiusKm: 30, price: 499, isActive: true },
];

export function getPromotionPlans(): PromotionPlan[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLANS));
    return DEFAULT_PLANS;
  }
  return JSON.parse(stored);
}

export function savePromotionPlans(plans: PromotionPlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}
