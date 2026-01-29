import { JobCategory } from "../types";

export const EMPLOYER_INDUSTRIES: {
  id: JobCategory;
  label: string;
}[] = [
  { id: JobCategory.HOSPITALITY, label: "Hospitality / Restaurant" },
  { id: JobCategory.RETAIL, label: "Retail / Shop" },
  { id: JobCategory.AUTOMOBILE, label: "Automobile" },
  { id: JobCategory.CONSTRUCTION, label: "Construction" },
  { id: JobCategory.FACTORY_MANUFACTURING, label: "Factory / Warehouse" },
  { id: JobCategory.DELIVERY_LOGISTICS, label: "Logistics" },
  { id: JobCategory.OFFICE_SERVICES, label: "Office / Services" },
];
