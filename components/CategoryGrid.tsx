import React from "react";
import { JobCategory } from "../types";
import { JOB_CATEGORY_LABELS } from "../i18n/jobCategories";
import { useLanguage } from "../context/LanguageContext";

interface CategoryGridProps {
  onSelect: (category: JobCategory) => void;
  selected?: JobCategory;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelect, selected }) => {
  const { language } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(JOB_CATEGORY_LABELS).map(([key, cat]) => {
        const isSelected = selected === key;

        return (
          <button
            key={key}
            onClick={() => onSelect(key as JobCategory)}
            className={`
              relative h-[120px] rounded-2xl border-2 flex flex-col
              items-center justify-center gap-2 transition-all
              active:scale-[0.97]
              ${
                isSelected
                  ? "border-indigo-600 bg-white shadow-md"
                  : "border-slate-200 bg-white"
              }
            `}
          >
            {/* ✅ Selected check */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">
                <i className="fa-solid fa-check"></i>
              </div>
            )}

            {/* Icon */}
            <div
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${
                  isSelected
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-slate-100 text-slate-500"
                }
              `}
            >
              <i className={`fa-solid ${cat.icon} text-xl`} />
            </div>

            {/* Label */}
            <p
              className={`
                text-[11px] font-black uppercase tracking-tight text-center
                ${isSelected ? "text-indigo-600" : "text-slate-500"}
              `}
            >
              {cat.labels[language] ?? cat.labels.en}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
