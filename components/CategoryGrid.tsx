import React, { useState } from "react";
import { JobCategory } from "../types";
import { JOB_CATEGORY_LABELS } from "../i18n/jobCategories";
import { useLanguage } from "../context/LanguageContext";

interface CategoryGridProps {
  onSelect: (category: JobCategory) => void;
  selected?: JobCategory;
}

const TOP_6_CATEGORIES: JobCategory[] = [
  JobCategory.DRIVER,
  JobCategory.HOUSEHOLD, // Helper
  JobCategory.SECURITY,
  JobCategory.DELIVERY_LOGISTICS, // Delivery
  JobCategory.CONSTRUCTION,
  JobCategory.RETAIL,
  JobCategory.OFFICE_SERVICES,
];

const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelect, selected }) => {
  const { language } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const categories = showAll ? Object.values(JobCategory) : TOP_6_CATEGORIES;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-900">Kaam ki Category</h2>

        {!showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-xs font-bold text-indigo-600"
          >
            View All
          </button>
        )}
      </div>

      {/* CATEGORY GRID */}
      <div
        className={`grid grid-cols-2 gap-4 ${
          showAll ? "max-h-[320px] overflow-y-auto pr-1 no-scrollbar" : ""
        }`}
      >
        {categories.map((key, idx) => {
          const cat = JOB_CATEGORY_LABELS[key];
          if (!cat) return null;

          const isSelected = selected === key;

          return (
            <button
              key={`${key}-${idx}`}
              onClick={() => onSelect(key)}
              className={`
                relative h-[100px] rounded-2xl border
                flex flex-col items-center justify-center gap-2
                transition-all active:scale-95
                ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-slate-200 bg-white"
                }
              `}
            >
              {/* ✅ Tick mark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] shadow">
                  <i className="fa-solid fa-check"></i>
                </div>
              )}

              {/* Icon */}
              <div
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${
                    isSelected
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-slate-100 text-slate-500"
                  }
                `}
              >
                <i className={`fa-solid ${cat.icon}`} />
              </div>

              {/* Label */}
              <p
                className={`
                  text-[11px] font-black uppercase tracking-tight text-center
                  ${isSelected ? "text-indigo-600" : "text-slate-600"}
                `}
              >
                {cat.labels[language] ?? cat.labels.en}
              </p>
            </button>
          );
        })}
      </div>

      {/* Hide scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CategoryGrid;
