import { Job } from "../types";
import { getJobStatusMeta } from "../utils/jobStatusMeta";

interface Props {
  job: Job;
  onBack: () => void;
}

const EmployerJobDetail: React.FC<Props> = ({ job, onBack }) => {
  const status = getJobStatusMeta(job.status);

  return (
    <div className="flex-1 bg-slate-50">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white border-b-2 border-slate-200 flex items-center gap-4">
        <button
          title="Back to My Jobs"
          aria-label="Back to My Jobs"
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2 className="text-lg font-black">Job Details</h2>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-[32px] border-2 border-slate-200 p-6 space-y-3">
          <h3 className="text-xl font-black">{job.jobRole}</h3>

          <p className="text-sm font-bold">
            Salary: ₹{job.salaryAmount} / {job.salaryType}
          </p>

          <p className="text-sm font-bold">Location: {job.location.address}</p>

          <p className={`text-sm font-black ${status.color}`}>
            Status: {status.label}
          </p>
        </div>

        {/* Promote CTA (only if approved / active) */}
        {(job.status === "APPROVED" || job.status === "ACTIVE") && (
          <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest">
            Promote This Job
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployerJobDetail;
