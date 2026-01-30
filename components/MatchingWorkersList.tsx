import React from "react";
import { EmployerProfile, WorkerProfile } from "../types";

interface MatchingWorkersListProps {
  employerProfile: EmployerProfile;
  workers: WorkerProfile[];
}

const MatchingWorkersList: React.FC<MatchingWorkersListProps> = ({
  employerProfile,
  workers,
}) => {
  if (!employerProfile?.industry) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
        Select an industry to see matching workers
      </div>
    );
  }

  const matchingWorkers = workers.filter(
    (w) => w.jobType === employerProfile.industry,
  );

  if (matchingWorkers.length === 0) {
    return (
      <div className="py-20 text-center opacity-40">
        <i className="fa-solid fa-users-slash text-5xl mb-4"></i>
        <p className="text-[10px] font-black uppercase tracking-widest">
          No matching workers found
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {matchingWorkers.map((worker, idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm space-y-3"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-black text-slate-900 text-sm">
                {worker.name}
              </h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {worker.preferredJobTitle}
              </p>
            </div>

            {worker.expectedSalary && (
              <div className="text-indigo-600 font-black text-sm">
                ₹{worker.expectedSalary}
              </div>
            )}
          </div>

          {worker.location?.address && (
            <div className="flex items-center gap-2 text-slate-500">
              <i className="fa-solid fa-location-dot text-xs"></i>
              <span className="text-[10px] font-bold">
                {worker.location.address}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={`tel:${worker.phone}`}
              className="bg-slate-900 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest active:scale-95 transition-all"
            >
              <i className="fa-solid fa-phone"></i> Call
            </a>

            <a
              href={`https://wa.me/91${worker.phone}`}
              className="bg-emerald-500 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest active:scale-95 transition-all"
            >
              <i className="fa-brands fa-whatsapp"></i> WhatsApp
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchingWorkersList;
