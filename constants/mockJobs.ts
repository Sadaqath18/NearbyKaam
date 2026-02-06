import { Job, JobCategory } from "../types";

/*
  ✅ GUARANTEES:
  - Every state
  - Every city
  - Every category
  - Some promoted jobs
  - Real coordinates (distance filter works)
*/

const STATES_AND_CITIES: Record<string, string[]> = {
  Karnataka: ["Bengaluru", "Mysuru", "Hubli"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  Delhi: ["New Delhi"],
  Telangana: ["Hyderabad"],
  Gujarat: ["Ahmedabad", "Surat"],
  Kerala: ["Kochi", "Thiruvananthapuram"],
  "Uttar Pradesh": ["Lucknow", "Kanpur"],
  Rajasthan: ["Jaipur"],
  "West Bengal": ["Kolkata"],
};

/* ---------- REAL CITY COORDS (CRITICAL for distance filter) ---------- */
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Mysuru: { lat: 12.2958, lng: 76.6394 },
  Hubli: { lat: 15.3647, lng: 75.124 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  "New Delhi": { lat: 28.6139, lng: 77.209 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Surat: { lat: 21.1702, lng: 72.8311 },
  Kochi: { lat: 9.9312, lng: 76.2673 },
  Thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Kanpur: { lat: 26.4499, lng: 80.3319 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
};

const ALL_CATEGORIES = Object.values(JobCategory);

/* ---------- TITLES ---------- */
const TITLES: Record<JobCategory, string[]> = {
  DRIVER: ["Car Driver", "Auto Driver", "Truck Driver"],
  DELIVERY_LOGISTICS: ["Delivery Boy", "Courier Rider"],
  HOUSEHOLD: ["Maid", "Cook", "Babysitter"],
  CONSTRUCTION: ["Mason", "Electrician", "Plumber"],
  RETAIL: ["Cashier", "Store Staff"],
  FACTORY_MANUFACTURING: ["Machine Operator", "Helper"],
  SECURITY: ["Security Guard"],
  HOSPITALITY: ["Cook", "Waiter"],
  OFFICE_SERVICES: ["Office Boy", "Data Entry"],
  AUTOMOBILE: ["Mechanic", "Service Technician"],
  HEALTHCARE_SUPPORT: ["Ward Helper", "Nurse Assistant"],
  AGRICULTURE: ["Farm Worker"],
  GIG_ON_DEMAND: ["Part Time Helper"],
};

const rand = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const generateMockJobs = (): Job[] => {
  const jobs: Job[] = [];
  let id = 1;

  Object.entries(STATES_AND_CITIES).forEach(([state, cities]) => {
    cities.forEach((city) => {
      const base = CITY_COORDS[city];

      ALL_CATEGORIES.forEach((category) => {
        const isPromoted = Math.random() > 0.7;

        const job: Job = {
          id: `JOB-${id++}`,

          title: rand(TITLES[category]),
          jobRole: rand(TITLES[category]),
          category,
          industry: category.replaceAll("_", " "),

          employerId: `EMP-${state}`,
          employerName: `${city} Employer`,

          description: "Immediate hiring. Contact now.",

          contact: {
            callNumber: "9876543210",
            whatsappNumber: "9876543210",
          },

          /* ✅ SAFEST (matches your type) */
          shopPhoto: null,

          /* ✅ REALISTIC LOCATION */
          location: {
            lat: base.lat + (Math.random() - 0.5) * 0.04,
            lng: base.lng + (Math.random() - 0.5) * 0.04,
            city,
            state,
            address: `${city}, ${state}`,
            source: "MANUAL",
          },

          salaryAmount: `${400 + Math.floor(Math.random() * 800)}`,
          salaryType: Math.random() > 0.5 ? "DAY" : "MONTH",

          minExperienceYears: rand([0, 1, 3]),

          status: "APPROVED",
          isLive: true,
          isVerified: true,

          callCount: 0,
          whatsappCount: 0,

          createdAt: new Date().toISOString(),
          expiryDays: 30,

          /* ✅ PROMOTION ADDED */
          promotion: isPromoted
            ? {
                isActive: true,
                startedAt: new Date().toISOString(),
                expiresAt: new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000,
                ).toISOString(),
                radiusKm: 10,
              }
            : undefined,
        };

        jobs.push(job);
      });
    });
  });

  return jobs;
};

export const MOCK_JOBS: Job[] = generateMockJobs();
