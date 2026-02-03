import React from "react";
import { Job } from "../types";

interface Props {
  jobs: Job[];
  onPromote: (job: Job) => void;
}

const EmployerPromoteView: React.FC<Props> = ({ jobs, onPromote }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* HEADER */}
      <div className="px-6 pt-12 pb-6 bg-white border-b-2 border-slate-200">
        <h2 className="text-lg font-black">Promote Jobs</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          Boost visibility • Get more calls
        </p>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {jobs.length === 0 && (
          <div className="py-24 text-center opacity-40">
            <i className="fa-solid fa-bolt text-6xl mb-4 text-slate-300"></i>
            <p className="font-black uppercase tracking-widest text-[10px]">
              No jobs available to promote
            </p>
          </div>
        )}

        {jobs.map((job) => {
          const isApproved = job.status === "APPROVED";
          const isPromoted = job.isPromoted === true;

          return (
            <div
              key={job.id}
              className="relative bg-white p-5 rounded-[28px] border-2 border-slate-100 shadow-sm"
            >
              {/* PROMOTED BADGE */}
              {isPromoted && (
                <span className="absolute top-3 right-3 bg-yellow-400 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase">
                  Promoted
                </span>
              )}

              <h4 className="font-black text-slate-900 truncate">
                {job.jobRole}
              </h4>

              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                Status: {job.status.replace(/_/g, " ")}
              </p>

              <p className="text-sm font-black text-indigo-600 mt-2">
                ₹{job.salaryAmount} / {job.salaryType}
              </p>

              {/* PROMOTION EXPIRY (EMPLOYER ONLY) */}
              {isPromoted && job.promotionExpiresAt && (
                <p className="mt-2 text-[10px] font-black text-slate-500">
                  Promotion ends on{" "}
                  {new Date(job.promotionExpiresAt).toLocaleDateString()}
                </p>
              )}

              {/* ACTIONS */}
              {isApproved ? (
                <button
                  onClick={() => onPromote(job)}
                  className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition"
                >
                  {isPromoted
                    ? "Review / Change Promotion"
                    : "Promote This Job"}
                </button>
              ) : (
                <div className="mt-4 text-[10px] font-bold uppercase text-slate-400">
                  Approval required to promote
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmployerPromoteView;
