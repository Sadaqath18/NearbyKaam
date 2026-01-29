import { JobCategory } from "../types";

export const CATEGORY_KEY_MAP = {
  Hospitality: JobCategory.Hospitality,
  CONSTRUCTION: JobCategory.CONSTRUCTION,
  Delivery & Logistics: JobCategory.Delivery & Logistics,
  Automobile: JobCategory.Automobile,
  HOUSE_HELP: JobCategory.HOUSE_HELP,
  SECURITY: JobCategory.SECURITY,
  SHOP: JobCategory.SHOP,
} as const;

export type JobCategoryKey = keyof typeof CATEGORY_KEY_MAP;
