import { PromotionPlan } from "../types";

const STORAGE_KEY = "nearbykaam_promotion_plans";

export const getPromotionPlans = (): PromotionPlan[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved
    ? JSON.parse(saved)
    : [
        { id: "5km", radiusKm: 5, price: 199, isActive: true },
        { id: "10km", radiusKm: 10, price: 299, isActive: true },
        { id: "20km", radiusKm: 20, price: 399, popular: true, isActive: true },
        { id: "30km", radiusKm: 30, price: 499, isActive: true },
      ];
};

export const savePromotionPlans = (plans: PromotionPlan[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
};
