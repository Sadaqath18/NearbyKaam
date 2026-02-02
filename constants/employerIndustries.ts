import { JobCategory } from "../types";

export const EMPLOYER_INDUSTRIES: ReadonlyArray<{
  id: JobCategory;
  label: string;
}> = [
  { id: JobCategory.HOSPITALITY, label: "Restaurant / Hotel / Cafe" },
  { id: JobCategory.RETAIL, label: "Retail / Shop" },
  { id: JobCategory.AUTOMOBILE, label: "Automobile / Garage" },
  { id: JobCategory.CONSTRUCTION, label: "Construction / Contractor" },
  { id: JobCategory.FACTORY_MANUFACTURING, label: "Factory / Warehouse" },
  { id: JobCategory.DELIVERY_LOGISTICS, label: "Delivery / Logistics" },
  { id: JobCategory.OFFICE_SERVICES, label: "Office / Services" },
  { id: JobCategory.SECURITY, label: "Security Services" },
  { id: JobCategory.HEALTHCARE_SUPPORT, label: "Healthcare Support" },
  { id: JobCategory.HOUSEHOLD, label: "Household / Domestic Help" },
  { id: JobCategory.AGRICULTURE, label: "Agriculture / Farming" },
  { id: JobCategory.GIG_ON_DEMAND, label: "Gig / On-Demand Work" },
  { id: JobCategory.DRIVER, label: "Driver / Transport" },
];
