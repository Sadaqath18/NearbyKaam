import { Job } from "../types";

/**
 * A job is visible to workers ONLY if:
 * - Admin has approved it
 * - It is active (not paused / expired)
 */
export const isJobVisibleToWorkers = (job: Job): boolean => {
  return (
    job.isLive === true &&
    (job.status === "ACTIVE" || job.status === "APPROVED")
  );
};
