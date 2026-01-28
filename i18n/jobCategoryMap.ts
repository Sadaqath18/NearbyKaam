import { JobCategory } from "../types";

export const CATEGORY_KEY_MAP = {
  HOTEL: JobCategory.HOTEL,
  CONSTRUCTION: JobCategory.CONSTRUCTION,
  DELIVERY: JobCategory.DELIVERY,
  GARAGE: JobCategory.GARAGE,
  HOUSE_HELP: JobCategory.HOUSE_HELP,
  SECURITY: JobCategory.SECURITY,
  SHOP: JobCategory.SHOP,
} as const;

export type JobCategoryKey = keyof typeof CATEGORY_KEY_MAP;
