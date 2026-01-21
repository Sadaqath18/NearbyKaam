import React, { useMemo, useState } from "react";
import { Job, JobCategory, SalaryType } from "../../types";
import { CATEGORIES } from "../../constants";

interface EmployerLite {
  id: string;
  shopName: string;
  employerName: string;
  phone: string;
}

interface Props {
  employers: EmployerLite[];
  onCreate: (job: Job) => void;
  onClose: () => void;
}

const SALARY_TYPES: SalaryType[] = ["DAY", "MONTH"];

const COMMON_JOB_ROLES = [
  "Helper",
  "Delivery Boy",
  "Sales Boy",
  "Cleaner",
  "Cook",
  "Driver",
  "Security Guard",
  "Warehouse Staff",
  "Electrician",
  "Plumber",
];

const COMMON_CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Coimbatore",
  "Mysuru",
];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const CreateJobModal: React.FC<Props> = ({ employers, onCreate, onClose }) => {
  if (!employers.length) {
    return (
      <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center text-white font-bold">
        Create an employer first.
      </div>
    );
  }

  /* ---------------- STATE ---------------- */
  const [jobTitle, setJobTitle] = useState("");
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);

  const [employerId, setEmployerId] = useState(employers[0].id);
  const employer = employers.find((e) => e.id === employerId)!;

  const [shopName, setShopName] = useState(employer.shopName);

  const [category, setCategory] = useState<JobCategory | "CUSTOM">(
    CATEGORIES[0].id,
  );
  const [customCategory, setCustomCategory] = useState("");
  const [manualShopName, setManualShopName] = useState("");

  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryType, setSalaryType] = useState<SalaryType>("DAY");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  /* ---------------- SUGGESTIONS ---------------- */
  const titleSuggestions = useMemo(() => {
    if (!jobTitle.trim()) return [];
    return COMMON_JOB_ROLES.filter((r) =>
      r.toLowerCase().includes(jobTitle.toLowerCase()),
    ).slice(0, 5);
  }, [jobTitle]);

  const citySuggestions = useMemo(() => {
    if (!city.trim()) return [];
    return COMMON_CITIES.filter((c) =>
      c.toLowerCase().includes(city.toLowerCase()),
    ).slice(0, 5);
  }, [city]);

  /* ---------------- DUPLICATE CHECK ---------------- */
  const isDuplicateTitle = (title: string) => {
    const stored = localStorage.getItem("nearbykaam_jobs_v3");
    if (!stored) return false;
    const jobs: Job[] = JSON.parse(stored);
    return jobs.some(
      (j) =>
        j.employerId === employerId &&
        j.title.toLowerCase() === title.toLowerCase(),
    );
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = () => {
    if (!jobTitle.trim()) return alert("Job title required");
    if (!salaryAmount.trim()) return alert("Salary required");
    if (isDuplicateTitle(jobTitle))
      return alert("Duplicate job title for this employer");

    const finalCategory =
      category === "CUSTOM" ? (customCategory.trim() as JobCategory) : category;

    const job: Job = {
      id: crypto.randomUUID(),
      title: jobTitle,
      jobRole: jobTitle,
      category: finalCategory,
      salaryAmount,
      salaryType,

      employerId,
      employerName: employer.employerName,
      shopName: manualShopName.trim() || employer.shopName,

      contact: {
        callNumber: employer.phone,
        whatsappNumber: employer.phone,
      },
      location: {
        address,
        city,
        state,
        lat: null,
        lng: null,
      },
      status: "PENDING_APPROVAL",
      isLive: false,
      isReported: false,
      isVerified: false,
      callCount: 0,
      whatsappCount: 0,
      isPromoted: false,
      shopPhoto: null,
      createdAt: new Date().toISOString(),
      expiryDays: 30,
    };

    onCreate(job);
    onClose();
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-black">Create Job</h2>

        {/* Job Title */}
        <div className="relative">
          <input
            placeholder="Job title"
            value={jobTitle}
            onChange={(e) => {
              setJobTitle(e.target.value);
              setShowTitleSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 150)}
            className="w-full border p-3 rounded-xl font-bold"
          />
          {showTitleSuggestions && titleSuggestions.length > 0 && (
            <div className="absolute w-full bg-white border rounded-xl mt-1 shadow-lg">
              {titleSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setJobTitle(s);
                    setShowTitleSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 font-bold"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Employer */}
        <select
          title="employer"
          value={employerId}
          onChange={(e) => {
            setEmployerId(e.target.value);
            setShopName(
              employers.find((x) => x.id === e.target.value)!.shopName,
            );
          }}
          className="w-full border p-3 rounded-xl font-bold"
        >
          {employers.map((e) => (
            <option key={e.id} value={e.id}>
              {e.shopName}
            </option>
          ))}
        </select>

        {/* Shop Name */}
        <input
          placeholder="Shop / Business name"
          value={manualShopName}
          onChange={(e) => setManualShopName(e.target.value)}
          className="w-full border p-3 text-sm rounded-xl font-bold mb-3"
        />

        {/* Category */}
        <select
          title="category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as JobCategory | "CUSTOM")
          }
          className="w-full border p-3 rounded-xl font-bold"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
          <option value="CUSTOM">Custom</option>
        </select>

        {category === "CUSTOM" && (
          <input
            placeholder="Custom category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            className="w-full border p-3 rounded-xl font-bold"
          />
        )}

        {/* Location */}
        <input
          placeholder="Full address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border p-3 rounded-xl font-bold"
        />

        <div className="relative">
          <input
            placeholder="City"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setShowCitySuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
            className="w-full border p-3 rounded-xl font-bold"
          />
          {showCitySuggestions && citySuggestions.length > 0 && (
            <div className="absolute w-full bg-white border rounded-xl mt-1 shadow-lg">
              {citySuggestions.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCity(c);
                    setShowCitySuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 font-bold"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* State */}
        <select
          title="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full border p-3 rounded-xl font-bold bg-white"
        >
          <option value="">Select State</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Salary */}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Salary"
            value={salaryAmount}
            onChange={(e) => setSalaryAmount(e.target.value)}
            className="flex-1 border p-3 rounded-xl font-bold"
          />
          <select
            title="salary-type"
            value={salaryType}
            onChange={(e) => setSalaryType(e.target.value as SalaryType)}
            className="border p-3 rounded-xl font-bold"
          >
            {SALARY_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border py-3 rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateJobModal;
