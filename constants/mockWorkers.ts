import { WorkerProfile, JobCategory } from "../types";

const ALL_CATEGORIES = Object.values(JobCategory);

const NAMES = [
  "Rajesh Kumar",
  "Amit Sharma",
  "Suresh Yadav",
  "Imran Khan",
  "Ravi Patel",
  "Manoj Singh",
  "Arjun Das",
  "Vikram Rao",
  "Salman Ali",
  "Deepak Gupta",
  "Kiran Kumar",
  "Faizan Ahmed",
  "Harish Nair",
  "Prakash Reddy",
  "Naveen Joshi",
];

const CITIES = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Kolkata",
  "Ahmedabad",
];

const TITLES: Record<JobCategory, string[]> = {
  DRIVER: ["Car Driver", "Truck Driver", "Auto Driver"],
  DELIVERY_LOGISTICS: ["Delivery Rider", "Courier Boy"],
  HOUSEHOLD: ["Maid", "Cook", "Babysitter"],
  CONSTRUCTION: ["Mason", "Electrician", "Plumber"],
  RETAIL: ["Sales Staff", "Cashier"],
  FACTORY_MANUFACTURING: ["Machine Operator", "Factory Helper"],
  SECURITY: ["Security Guard"],
  HOSPITALITY: ["Cook", "Waiter", "Housekeeping Staff"],
  OFFICE_SERVICES: ["Office Boy", "Data Entry Operator"],
  AUTOMOBILE: ["Mechanic", "Service Technician"],
  HEALTHCARE_SUPPORT: ["Ward Boy", "Nursing Assistant"],
  AGRICULTURE: ["Farm Worker", "Dairy Helper"],
  GIG_ON_DEMAND: ["Part-time Helper", "Event Staff"],
};

const rand = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const randomPhone = () =>
  "9" + Math.floor(100000000 + Math.random() * 900000000);

/*
  FREE SAMPLE AUDIO FILE
  small mp3 for testing
*/
const SAMPLE_AUDIO =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export const generateMockWorkers = (count = 150): WorkerProfile[] => {
  const workers: WorkerProfile[] = [];

  for (let i = 0; i < count; i++) {
    const category = ALL_CATEGORIES[i % ALL_CATEGORIES.length];

    const hasAudio = Math.random() > 0.5;

    workers.push({
      name: rand(NAMES),
      phone: randomPhone(),

      jobType: category,
      preferredJobTitle: rand(TITLES[category]),

      expectedSalary: 12000 + Math.floor(Math.random() * 15000),
      expectedSalaryType: Math.random() > 0.5 ? "MONTHLY" : "DAILY",

      experienceYears: rand([0, 1, , 3]),

      location: {
        lat: 12 + Math.random(),
        lng: 77 + Math.random(),
        address: rand(CITIES),
      },

      resume: {
        hasAudio,
        audioUrl: hasAudio ? SAMPLE_AUDIO : null,
        hasDocument: true,
        documentName: "Resume.pdf",
        documentUrl: "#",
      },

      createdAt: new Date().toISOString(),
    });
  }

  return workers;
};

export const MOCK_WORKERS: WorkerProfile[] = generateMockWorkers(150);

console.log("workers loaded");
