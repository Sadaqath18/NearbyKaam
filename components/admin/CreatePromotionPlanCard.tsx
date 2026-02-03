import React, { useState, useMemo } from "react";
import { PromotionPlan } from "../../types";

type DraftPromotionPlan = Omit<PromotionPlan, "id">;

interface Props {
  existingRadii: number[]; // for duplicate check
  hasActivePlan: boolean; // prevent deactivating all plans
  onCreate: (plan: DraftPromotionPlan) => void;
  onError?: (msg: string) => void;
}

const CreatePromotionPlanCard: React.FC<Props> = ({
  existingRadii,
  hasActivePlan,
  onCreate,
  onError,
}) => {
  const [radiusKm, setRadiusKm] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [popular, setPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  /* ---------- VALIDATION ---------- */
  const validationError = useMemo(() => {
    if (radiusKm === "" || price === "") return "Enter radius and price";
    if (radiusKm <= 0) return "Radius must be greater than 0";
    if (price <= 0) return "Price must be greater than 0";
    if (existingRadii.includes(Number(radiusKm)))
      return "This radius already exists";
    if (!isActive && !hasActivePlan)
      return "At least one plan must stay active";
    return null;
  }, [radiusKm, price, isActive, existingRadii, hasActivePlan]);

  const canSave = !validationError && !isSaving;

  /* ---------- SAVE ---------- */
  const handleSave = () => {
    if (!canSave) return;

    try {
      setIsSaving(true);

      onCreate({
        radiusKm: Number(radiusKm),
        price: Number(price),
        popular,
        isActive,
      });

      // reset form
      setRadiusKm("");
      setPrice("");
      setPopular(false);
      setIsActive(true);
    } catch (err: any) {
      onError?.(err.message || "Failed to create plan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-6 mt-6">
      <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
        <i className="fa-solid fa-plus"></i>
        Create New Promotion Plan
      </h3>

      {/* INPUTS */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          min={1}
          placeholder="Radius (KM)"
          value={radiusKm}
          onChange={(e) =>
            setRadiusKm(e.target.value ? Number(e.target.value) : "")
          }
          className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-sm font-bold focus:border-indigo-600 outline-none"
        />

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
            ₹
          </span>
          <input
            type="number"
            min={1}
            placeholder="Price"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value ? Number(e.target.value) : "")
            }
            className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 pl-10 text-sm font-bold focus:border-indigo-600 outline-none"
          />
        </div>
      </div>

      {/* TOGGLES */}
      <div className="flex items-center gap-6 mt-4">
        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
          <input
            type="checkbox"
            checked={popular}
            onChange={(e) => setPopular(e.target.checked)}
            className="w-4 h-4 accent-yellow-500"
          />
          Popular
        </label>

        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-indigo-600"
          />
          Active
        </label>
      </div>

      {/* ERROR */}
      {validationError && (
        <p className="mt-3 text-[10px] font-black text-red-500 uppercase tracking-widest">
          {validationError}
        </p>
      )}

      {/* CTA */}
      <button
        onClick={handleSave}
        disabled={!canSave}
        className={`mt-6 w-full py-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all
          ${
            canSave
              ? "bg-indigo-600 text-white active:scale-95"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
      >
        {isSaving ? "Saving..." : "Save Plan"}
      </button>
    </div>
  );
};

export default CreatePromotionPlanCard;
