import { Job } from "../types";

export const getJobStatusMeta = (status: Job["status"]) => {
  switch (status) {
    case "ACTIVE":
      return { label: "Active", color: "text-emerald-600" };
    case "APPROVED":
      return { label: "Approved", color: "text-blue-600" };
    case "PENDING_APPROVAL":
      return { label: "Pending Approval", color: "text-orange-500" };
    case "PAUSED":
      return { label: "Paused", color: "text-slate-500" };
    case "EXPIRED":
      return { label: "Expired", color: "text-slate-400" };
    case "REJECTED":
      return { label: "Rejected", color: "text-red-500" };
    default:
      return { label: status, color: "text-slate-400" };
  }
};
