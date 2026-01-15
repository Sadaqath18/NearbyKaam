
import React from 'react';
import { CATEGORIES } from '../constants';
import { JobCategory } from '../types';

interface CategoryGridProps {
  onSelect: (category: JobCategory) => void;
  selected?: JobCategory;
  layout?: 'grid' | 'scroll';
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelect, selected, layout = 'grid' }) => {
  if (layout === 'scroll') {
    return (
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
        <button
          onClick={() => onSelect(JobCategory.OTHER)}
          className={`shrink-0 flex flex-col items-center gap-2 group outline-none transition-all active:scale-90 ${!selected || selected === JobCategory.OTHER ? 'scale-105' : 'opacity-60'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${!selected || selected === JobCategory.OTHER ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
            <i className="fa-solid fa-layer-group text-xl"></i>
          </div>
          <span className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${!selected || selected === JobCategory.OTHER ? 'text-indigo-600' : 'text-slate-400'}`}>All</span>
        </button>
        {CATEGORIES.filter(c => c.id !== JobCategory.OTHER).map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`shrink-0 flex flex-col items-center gap-2 group outline-none transition-all active:scale-90 ${selected === cat.id ? 'scale-105' : 'opacity-60'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${selected === cat.id ? `${cat.color} border-white/20 text-white shadow-lg` : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
              <i className={`fa-solid ${cat.icon} text-xl`}></i>
            </div>
            <span className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${selected === cat.id ? 'text-slate-900' : 'text-slate-400'}`}>
              {cat.label.split(' / ')[0]}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`min-h-[110px] rounded-[24px] p-3 flex flex-col items-center justify-center transition-all border-2 text-center group active:scale-[0.96] ${
            selected === cat.id 
            ? `${cat.color} border-transparent text-white shadow-lg scale-[1.02]` 
            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-all ${selected === cat.id ? 'bg-white/20' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
            <i className={`fa-solid ${cat.icon} text-base`}></i>
          </div>
          <span className="text-[8px] font-black uppercase tracking-tight leading-tight px-0.5">
            {cat.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryGrid;
