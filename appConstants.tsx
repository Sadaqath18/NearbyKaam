import { JobCategory, Language } from "./types";

export const LANGUAGES: Language[] = [
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "or", name: "Odia", nativeName: "ଓಡಿଆ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "ks", name: "Kashmiri", nativeName: "कॉशুর" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
];

export const STATES_AND_CITIES: Record<string, string[]> = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  Delhi: [
    "New Delhi",
    "North Delhi",
    "South Delhi",
    "East Delhi",
    "West Delhi",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
  ],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
};

export const ADMIN_WHITELIST = [
  "9876543210",
  "9123456789",
  "9999999999",
  "8888888888",
];

export const CATEGORIES = [
  {
    id: JobCategory.DRIVER,
    label: "Driver",
    icon: "fa-car",
    color: "bg-indigo-500",
  },
  {
    id: JobCategory.DELIVERY_LOGISTICS,
    label: "Delivery & Logistics",
    icon: "fa-motorcycle",
    color: "bg-yellow-500",
  },
  {
    id: JobCategory.HOUSEHOLD,
    label: "Household",
    icon: "fa-broom",
    color: "bg-pink-500",
  },
  {
    id: JobCategory.CONSTRUCTION,
    label: "Construction",
    icon: "fa-helmet-safety",
    color: "bg-amber-600",
  },
  {
    id: JobCategory.RETAIL,
    label: "Retail",
    icon: "fa-store",
    color: "bg-blue-500",
  },
  {
    id: JobCategory.FACTORY_MANUFACTURING,
    label: "Factory & Manufacturing",
    icon: "fa-industry",
    color: "bg-gray-700",
  },
  {
    id: JobCategory.SECURITY,
    label: "Security",
    icon: "fa-shield-halved",
    color: "bg-emerald-600",
  },
  {
    id: JobCategory.HOSPITALITY,
    label: "Hospitality",
    icon: "fa-utensils",
    color: "bg-orange-500",
  },
  {
    id: JobCategory.OFFICE_SERVICES,
    label: "Office & Services",
    icon: "fa-briefcase",
    color: "bg-slate-600",
  },
  {
    id: JobCategory.AUTOMOBILE,
    label: "Automobile",
    icon: "fa-screwdriver-wrench",
    color: "bg-slate-800",
  },
  {
    id: JobCategory.HEALTHCARE_SUPPORT,
    label: "Healthcare Support",
    icon: "fa-heart-pulse",
    color: "bg-red-500",
  },
  {
    id: JobCategory.AGRICULTURE,
    label: "Agriculture",
    icon: "fa-seedling",
    color: "bg-green-600",
  },
  {
    id: JobCategory.GIG_ON_DEMAND,
    label: "Gig & On-demand",
    icon: "fa-bolt",
    color: "bg-purple-600",
  },
];

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
