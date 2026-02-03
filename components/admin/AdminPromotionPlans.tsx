import React, { useState, useEffect } from "react";
import { PromotionPlan } from "../../types";
import {
  getPromotionPlans,
  savePromotionPlans,
} from "../../services/promotionPlanService";

const AdminPromotionPlans: React.FC = () => {
  const [plans, setPlans] = useState<PromotionPlan[]>([]);

  useEffect(() => {
    setPlans(getPromotionPlans());
  }, []);

  const updatePlan = (id: string, field: keyof PromotionPlan, value: any) => {
    const updated = plans.map((p) =>
      p.id === id ? { ...p, [field]: value } : p,
    );
    setPlans(updated);
    savePromotionPlans(updated);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-sm font-black uppercase tracking-widest">
        Promotion Pricing Control
      </h2>

      {plans.map((plan) => (
        <div
          key={plan.id}
          className="bg-white p-5 rounded-3xl border flex justify-between items-center"
        >
          <div>
            <p className="font-black">{plan.radiusKm} KM Radius</p>
            <input
              aria-label="Price for this promotion plan"
              type="number"
              value={plan.price}
              onChange={(e) =>
                updatePlan(plan.id, "price", Number(e.target.value))
              }
              className="mt-2 border rounded px-3 py-1 text-sm w-24"
            />
          </div>

          <div className="flex gap-3 items-center">
            <label className="text-xs font-bold">
              Popular
              <input
                type="checkbox"
                checked={!!plan.popular}
                onChange={(e) =>
                  updatePlan(plan.id, "popular", e.target.checked)
                }
                className="ml-2"
              />
            </label>

            <label className="text-xs font-bold">
              Active
              <input
                type="checkbox"
                checked={plan.isActive}
                onChange={(e) =>
                  updatePlan(plan.id, "isActive", e.target.checked)
                }
                className="ml-2"
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminPromotionPlans;
