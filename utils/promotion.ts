import { Job } from "../types";

export function isPromotionActive(job: Job): boolean {
  if (!job.isPromoted) return false;
  if (!job.promotionExpiresAt) return false;

  return new Date(job.promotionExpiresAt) > new Date();
}
