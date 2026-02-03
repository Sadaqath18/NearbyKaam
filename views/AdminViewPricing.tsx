import { useState } from "react";
import {
  getPromotionPlans,
  savePromotionPlans,
} from "../services/promotionPlanService";

const AdminPricingView = () => {
  const [plans, setPlans] = useState(getPromotionPlans());

  const updatePrice = (id: string, price: number) => {
    const updated = plans.map((p) => (p.id === id ? { ...p, price } : p));
    setPlans(updated);
    savePromotionPlans(updated);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-black">Promotion Pricing</h2>

      {plans.map((plan) => (
        <div
          key={plan.id}
          className="bg-white p-4 rounded-2xl border flex justify-between items-center"
        >
          <div>
            <p className="font-black">{plan.radiusKm} KM Radius</p>
            {plan.popular && (
              <span className="text-[9px] font-black text-yellow-600">
                POPULAR
              </span>
            )}
          </div>

          <input
            aria-label="number"
            type="number"
            value={plan.price}
            onChange={(e) => updatePrice(plan.id, Number(e.target.value))}
            className="w-24 border rounded-xl p-2 font-black"
          />
        </div>
      ))}
    </div>
  );
};

export default AdminPricingView;
