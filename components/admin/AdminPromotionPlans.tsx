import React, { useEffect, useState } from "react";
import { PromotionPlan } from "../../types";
import {
  getPromotionPlans,
  savePromotionPlans,
  addPromotionPlan,
} from "../../services/promotionPlanService";
import CreatePromotionPlanCard from "./CreatePromotionPlanCard";

const AdminPromotionPlans: React.FC = () => {
  const [plans, setPlans] = useState<PromotionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPlans(getPromotionPlans());
  }, []);

  /* ---------- UPDATE EXISTING PLAN ---------- */
  const updatePlan = (id: string, field: keyof PromotionPlan, value: any) => {
    let updated = plans.map((p) =>
      p.id === id ? { ...p, [field]: value } : p,
    );

    // ✅ Only ONE popular plan allowed
    if (field === "popular" && value === true) {
      updated = updated.map((p) =>
        p.id === id ? { ...p, popular: true } : { ...p, popular: false },
      );
    }

    // ❌ Cannot deactivate all plans
    if (field === "isActive") {
      const activeCount = updated.filter((p) => p.isActive).length;
      if (activeCount === 0) {
        setError("At least one promotion plan must stay active");
        return;
      }
    }

    setPlans(updated);
    savePromotionPlans(updated);
    setError(null);
  };

  /* ---------- CREATE NEW PLAN ---------- */
  const handleCreatePlan = (draft: Omit<PromotionPlan, "id">) => {
    try {
      const fullPlan: PromotionPlan = {
        ...draft,
        id: `${draft.radiusKm}km`,
      };

      const updated = addPromotionPlan(plans, fullPlan);
      setPlans(updated);
      savePromotionPlans(updated);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <h2 className="text-sm font-black uppercase tracking-widest">
        Promotion Pricing Control
      </h2>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-600 text-xs font-black p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* ---------- EXISTING PLANS ---------- */}
      <div className="space-y-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-[28px] border p-6 transition-all
              ${
                plan.popular
                  ? "border-yellow-400 shadow-yellow-100 shadow-lg"
                  : "border-slate-200"
              }
            `}
          >
            {/* POPULAR BADGE */}
            {plan.popular && (
              <span className="absolute -top-3 left-6 bg-yellow-400 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Popular Plan
              </span>
            )}

            <div className="flex justify-between items-start">
              {/* LEFT */}
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {plan.radiusKm} KM Radius
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  Promotion Reach
                </p>
              </div>

              {/* PRICE */}
              <div className="text-right">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                    ₹
                  </span>
                  <input
                    aria-label="type-number"
                    type="number"
                    value={plan.price}
                    onChange={(e) =>
                      updatePlan(plan.id, "price", Number(e.target.value))
                    }
                    className="w-28 pl-7 pr-3 py-2 rounded-xl border-2 border-slate-200
                      text-lg font-black text-indigo-600 text-right
                      focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="my-5 h-px bg-slate-100" />

            {/* CONTROLS */}
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600">
                <input
                  type="checkbox"
                  checked={!!plan.popular}
                  onChange={(e) =>
                    updatePlan(plan.id, "popular", e.target.checked)
                  }
                  className="w-4 h-4 accent-yellow-400"
                />
                Popular
              </label>

              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600">
                <input
                  type="checkbox"
                  checked={plan.isActive}
                  onChange={(e) =>
                    updatePlan(plan.id, "isActive", e.target.checked)
                  }
                  className="w-4 h-4 accent-indigo-600"
                />
                Active
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- CREATE NEW PLAN ---------- */}
      <CreatePromotionPlanCard
        existingRadii={plans.map((p) => p.radiusKm)}
        hasActivePlan={plans.some((p) => p.isActive)}
        onCreate={handleCreatePlan}
        onError={setError}
      />
    </div>
  );
};

export default AdminPromotionPlans;
