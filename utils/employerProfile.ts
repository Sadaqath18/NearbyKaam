import { EmployerProfile, JobCategory, Location, ShopPhoto } from "../types";

export const createEmptyEmployerProfile = (
  phone: string,
  industry: JobCategory, // ✅ must be passed from signup
): EmployerProfile => ({
  phone,
  firstName: "",
  shopName: "",
  industry, // 🔒 set once, source of truth
  location: null as Location | null,
  shopPhoto: null as ShopPhoto | null,
  createdAt: new Date().toISOString(),
});
