import React from "react";
import { WorkerProfile } from "../types";
import { CATEGORIES } from "../constants";

interface Props {
  workers: WorkerProfile[];
  onSelectWorker?: (w: WorkerProfile) => void;
}

const MatchingWorkersView: React.FC<Props> = ({ workers }) => {
  // ✅ Proper empty state (early return)
  if (!workers || workers.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-slate-50">
        <i className="fa-solid fa-users-slash text-6xl text-slate-200 mb-4"></i>
        <h3 className="font-black text-slate-700 text-lg">
          No matching workers yet
        </h3>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
          Workers from your industry will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50">
      <h2 className="text-sm font-black uppercase tracking-widest text-slate-600">
        Nearby Workers
      </h2>

      {workers.map((worker, idx) => {
        const category = CATEGORIES.find((c) => c.id === worker.jobType);

        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-[28px] border-2 border-slate-100 shadow-sm flex justify-between items-center"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                  category?.color ?? "bg-slate-400"
                }`}
              >
                <i className={`fa-solid ${category?.icon ?? "fa-user"}`}></i>
              </div>

              <div className="min-w-0 space-y-1">
                <p className="font-black text-sm truncate">{worker.name}</p>

                <p className="text-[9px] font-bold uppercase text-slate-400">
                  {worker.preferredJobTitle}
                </p>

                <p className="text-[9px] text-slate-500 truncate">
                  {worker.location?.address}
                </p>

                {/* ✅ Industry badge */}
                <span className="inline-block mt-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {worker.jobType.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <a
              href={`tel:${worker.phone}`}
              className="px-4 py-2 bg-emerald-500 text-white text-[9px] font-black rounded-full uppercase active:scale-95 transition"
            >
              Call
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default MatchingWorkersView;
