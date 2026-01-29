import { JobCategory } from "../types";

/**
 * Maps external / string-based category keys
 * (AI, voice, legacy data, form inputs)
 * to strict JobCategory enum values
 */
export const CATEGORY_KEY_MAP = {
  DRIVER: JobCategory.DRIVER,
  DELIVERY_LOGISTICS: JobCategory.DELIVERY_LOGISTICS,
  HOUSEHOLD: JobCategory.HOUSEHOLD,
  CONSTRUCTION: JobCategory.CONSTRUCTION,
  RETAIL: JobCategory.RETAIL,
  FACTORY_MANUFACTURING: JobCategory.FACTORY_MANUFACTURING,
  SECURITY: JobCategory.SECURITY,
  HOSPITALITY: JobCategory.HOSPITALITY,
  OFFICE_SERVICES: JobCategory.OFFICE_SERVICES,
  AUTOMOBILE: JobCategory.AUTOMOBILE,
  HEALTHCARE_SUPPORT: JobCategory.HEALTHCARE_SUPPORT,
  AGRICULTURE: JobCategory.AGRICULTURE,
  GIG_ON_DEMAND: JobCategory.GIG_ON_DEMAND,
} as const;

export type JobCategoryKey = keyof typeof CATEGORY_KEY_MAP;
