import React from "react";
import { WorkerProfile } from "../types";
import { CATEGORIES } from "../constants";

interface Props {
  workers: WorkerProfile[];
  onSelectWorker?: (w: WorkerProfile) => void;
}

const MatchingWorkersView: React.FC<Props> = ({ workers }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50">
      <h2 className="text-sm font-black uppercase tracking-widest text-slate-600">
        Nearby Workers
      </h2>

      {workers.length === 0 && (
        <div className="py-20 text-center opacity-40">
          <i className="fa-solid fa-users text-5xl mb-4"></i>
          <p className="text-[10px] font-black uppercase tracking-widest">
            No workers found nearby
          </p>
        </div>
      )}

      {workers.map((w, idx) => {
        const cat = CATEGORIES.find((c) => c.id === w.jobType);

        if (workers.length === 0) {
          return (
            <div className="py-20 text-center opacity-40">
              <i className="fa-solid fa-users-slash text-6xl mb-4"></i>
              <p className="font-black uppercase text-[10px]">
                No matching workers found
              </p>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-[28px] border-2 border-slate-100 shadow-sm flex justify-between items-center"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${cat?.color}`}
              >
                <i className={`fa-solid ${cat?.icon}`}></i>
              </div>

              <div className="min-w-0">
                <p className="font-black text-sm truncate">{w.name}</p>
                <p className="text-[9px] font-bold uppercase text-slate-400">
                  {w.preferredJobTitle}
                </p>
                <p className="text-[9px] text-slate-500 truncate">
                  {w.location?.address}
                </p>
              </div>
            </div>

            <a
              href={`tel:${w.phone}`}
              className="px-4 py-2 bg-emerald-500 text-white text-[9px] font-black rounded-full uppercase"
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
