import { EmployerProfile, JobCategory, Location } from "../types";

export const createEmptyEmployerProfile = (phone: string): EmployerProfile => ({
  phone,
  firstName: "",
  shopName: "",
  industry: null as unknown as JobCategory,
  location: null as Location | null,
  shopPhoto: null,
  createdAt: new Date().toISOString(),
});
