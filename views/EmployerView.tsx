import React, { useState, useEffect, useRef } from "react";
import {
  Job,
  JobCategory,
  Location,
  SalaryType,
  ShopPhoto,
  WorkerProfile,
  User,
} from "../types";
import { CATEGORIES } from "../appConstants";
import { EmployerProfile } from "../types";
import { createEmptyEmployerProfile } from "../utils/employerProfile";
import EmployerProfileDrawer from "../components/EmployerProfileDrawer";
import EmployerBottomNav, {
  EmployerTab,
} from "../components/EmployerBottomNav";
import { useLanguage } from "../context/LanguageContext";
import MatchingWorkersView from "../components/MatchingWorkersView";
import EmployerJobDetail from "../components/EmployerJobDetail";
import EmployerPromoteView from "../components/EmployerPromoteView";
import PromoteJobView from "./PromoteJobView";
import { getPromotionPlans } from "../services/promotionPlanService";
import { MOCK_WORKERS } from "../constants/mockWorkers";

interface EmployerViewProps {
  onJobSubmit: (job: Job) => void;
  allJobs: Job[];
  onChangeLanguage: () => void;
  currentUser: User | null;
  onLogout: () => void;

  onUpdateJob: (jobId: string, updates: Partial<Job>) => Promise<void>;
  onDeleteJob: (jobId: string) => void;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const EmployerView: React.FC<EmployerViewProps> = ({
  onJobSubmit,
  allJobs,
  currentUser,
  onChangeLanguage,
  onLogout,
  onUpdateJob,
  onDeleteJob,
}) => {
  const [employerProfile, setEmployerProfile] =
    useState<EmployerProfile | null>(null);

  const [view, setView] = useState<
    | "HOME"
    | "MATCHING_WORKERS"
    | "PROMOTE"
    | "PROMOTE_JOB"
    | "POST_JOB"
    | "APPLICANTS"
    | "SUCCESS"
    | "JOB_DETAIL"
  >("HOME");

  useEffect(() => {
    if (!currentUser?.phone) return;

    const key = `nearbykaam_employer_profile_${currentUser.phone}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      setEmployerProfile(JSON.parse(saved) as EmployerProfile);
    } else {
      const fresh = createEmptyEmployerProfile(currentUser.phone, undefined);

      setEmployerProfile(fresh);
      localStorage.setItem(key, JSON.stringify(fresh));
    }
  }, [currentUser?.phone]);

  console.log("Jobs received from App:", allJobs.length);

  const [isReviewing, setIsReviewing] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isEmployerProfileOpen, setIsEmployerProfileOpen] = useState(false);

  const [postData, setPostData] = useState({
    firstName: "",
    shopName: "",
    jobRole: "",
    category: undefined as JobCategory | undefined,
    description: "",
    callNumber: currentUser?.phone || "",
    whatsappNumber: currentUser?.phone || "",
    sameAsWhatsApp: true,
    salaryAmount: "",
    salaryType: undefined as SalaryType | undefined,

    minExperienceYears: 0,

    location: null as Location | null,
    shopPhoto: null as ShopPhoto | null,
  });

  useEffect(() => {
    if (!employerProfile) return;

    setPostData((prev) => ({
      ...prev,
      firstName: employerProfile.firstName,
      shopName: employerProfile.shopName,
      location: employerProfile.location,
      callNumber: employerProfile.phone,
    }));
  }, [employerProfile]);

  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const promotionPlans = getPromotionPlans().filter((p) => p.isActive);

  const myJobs = allJobs.filter(
    (j) =>
      j.employerId === currentUser?.phone ||
      j.contact.callNumber === currentUser?.phone,
  );

  const handleAudioToggle = async (url: string, id: string) => {
    if (!audioRef.current) audioRef.current = new Audio();
    if (playingAudioId === id) {
      audioRef.current.pause();
      setPlayingAudioId(null);
      return;
    }
    try {
      audioRef.current.pause();
      audioRef.current.src = url;
      setPlayingAudioId(id);
      await audioRef.current.play();
    } catch (e: any) {
      if (e.name !== "AbortError") console.error("Playback error", e);
      if (playingAudioId === id) setPlayingAudioId(null);
    }
    audioRef.current.onended = () => setPlayingAudioId(null);
  };

  const handleSubmitJob = () => {
    if (!isEmployerProfileComplete(employerProfile)) {
      setIsEmployerProfileOpen(true); // force profile completion
      return;
    }

    if (!validateForm()) return;

    setIsVerifyingOtp(true);
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!postData.firstName.trim()) e.firstName = "Name required";
    if (!postData.shopName.trim()) e.shopName = "Business name required";
    if (!postData.jobRole.trim()) e.jobRole = "Job title required";
    if (!postData.category) e.category = "Category required";

    if (!postData.salaryAmount || isNaN(Number(postData.salaryAmount)))
      e.salary = "Valid amount required";

    if (!postData.salaryType) e.salaryType = "Select salary type";

    if (!postData.location?.address || postData.location?.address.trim() === "")
      e.location = "Location required";

    if (!/^[6-9]\d{9}$/.test(postData.callNumber))
      e.callNumber = "Valid 10-digit number required";
    if (
      !postData.sameAsWhatsApp &&
      !/^[6-9]\d{9}$/.test(postData.whatsappNumber)
    )
      e.whatsappNumber = "Valid 10-digit number required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isEmployerProfileComplete = (profile: EmployerProfile | null) => {
    if (!profile) return false;

    return (
      profile.firstName?.trim() &&
      profile.shopName?.trim() &&
      profile.location?.address?.trim()
      // ⚠️ industry intentionally NOT checked
    );
  };

  const mustCompleteEmployerProfile =
    !!employerProfile && !isEmployerProfileComplete(employerProfile);

  const handleStartPosting = () => {
    if (!isEmployerProfileComplete(employerProfile)) {
      setIsEmployerProfileOpen(true);
      return;
    }

    if (!validateForm()) return;

    setIsVerifyingOtp(true);
  };

  const handleVerifyOtp = () => {
    if (otpValue.join("") === "123456") {
      setIsVerifyingOtp(false);
      setErrors({});
      setIsReviewing(true);
    } else {
      setErrors({ otp: "Wrong code (Demo: 123456)" });
    }
  };

  const handleFinalSubmit = () => {
    setIsPosting(true);
    setTimeout(() => {
      if (employerProfile) {
        const updatedProfile = {
          ...employerProfile,
          firstName: postData.firstName,
          shopName: postData.shopName,
          industry: employerProfile.industry, // locked
          location: postData.location ?? employerProfile.location,
        };

        localStorage.setItem(
          `nearbykaam_employer_profile_${employerProfile.phone}`,
          JSON.stringify(updatedProfile),
        );

        setEmployerProfile(updatedProfile);
      }

      onJobSubmit({
        id: crypto.randomUUID(),
        title: postData.jobRole,
        jobRole: postData.jobRole,
        category: postData.category,
        industry: employerProfile.industry!,
        employerFirstName: postData.firstName,
        employerId: currentUser?.phone!,
        employerName: postData.shopName,
        shopName: postData.shopName,
        description: postData.description,
        contact: {
          callNumber: postData.callNumber,
          whatsappNumber: postData.sameAsWhatsApp
            ? postData.callNumber
            : postData.whatsappNumber,
        },
        shopPhoto: postData.shopPhoto,
        location: postData.location!,
        salaryAmount: postData.salaryAmount,
        salaryType: postData.salaryType,
        minExperienceYears: postData.minExperienceYears,
        isVerified: false,
        isPromoted: false,
        status: "PENDING_APPROVAL", // admin must approve before job goes live
        isLive: false, // becomes true only after approval

        approvedAt: undefined,
        approvedBy: undefined,
        promotion: undefined,

        callCount: 0,
        whatsappCount: 0,

        createdAt: new Date().toISOString(),
        expiryDays: 15,
      });
      setIsPosting(false);
      setIsReviewing(false);
      setView("SUCCESS");
    }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPostData({
        ...postData,
        shopPhoto: {
          url: event.target?.result as string,
          uploadedAt: new Date().toISOString(),
        },
      });
    };
    reader.readAsDataURL(file);
  };
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<EmployerTab>("HOME");
  useEffect(() => {
    if (activeTab === "HOME") setView("HOME");
    if (activeTab === "MATCHING_WORKERS") {
      if (!employerProfile?.industry) {
        setIsEmployerProfileOpen(true);
        setActiveTab("HOME");
        return;
      }
      setView("MATCHING_WORKERS");
    }

    if (activeTab === "PROMOTE") setView("PROMOTE");
    if (activeTab === "PROFILE") setIsEmployerProfileOpen(true);
  }, [activeTab]);

  // Employer industry → allowed job categories
  const employerJobCategories = employerProfile?.industry
    ? [employerProfile.industry]
    : [];

  // Workers shown in Workers tab
  const matchingWorkers = MOCK_WORKERS.filter((worker) =>
    employerJobCategories.includes(worker.jobType),
  );

  const handlePromote = async (jobId: string, planId: string) => {
    const plan = promotionPlans.find((p) => p.id === planId);
    if (!plan) return;

    // (Later) integrate payment here
    const paymentSuccess = true;

    if (!paymentSuccess) return;

    await onUpdateJob(jobId, {
      isPromoted: true,
      promotionRadiusKm: plan.radiusKm,
      promotionExpiresAt: addDays(new Date(), 7), // or plan-based later
    });

    setView("PROMOTE"); // or JOBS / DASHBOARD
  };

  const renderHome = () => (
    <div className="flex-1 overflow-y-auto pb-32 no-scrollbar bg-white">
      <div className="bg-slate-900 px-6 pt-12 pb-10 rounded-b-[40px] shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="text-left">
            <h1 className="text-2xl font-black text-white">Employer Hub</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              Manage local postings
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Change Language */}
            <button
              title="Change Language"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChangeLanguage();
              }}
              className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all"
            >
              <i className="fa-solid fa-globe"></i>
            </button>

            {/* Logout */}
            <button
              title="Logout"
              onClick={onLogout}
              className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-slate-800 p-5 rounded-[32px] border border-slate-700 text-left">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Active Jobs
            </p>
            <p className="text-2xl font-black text-white">{myJobs.length}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-[32px] border border-slate-700 text-left">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Total Calls
            </p>
            <p className="text-2xl font-black text-orange-500">
              {myJobs.reduce((acc, j) => acc + j.callCount, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6 px-1">
          <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">
            My Job Postings
          </h2>
          <button
            onClick={() => {
              setView("POST_JOB");
              setIsReviewing(false);
              setIsVerifyingOtp(false);
              setErrors({});
            }}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-black uppercase text-[9px] tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-plus-circle mr-2"></i> Post Job
          </button>
        </div>

        <div className="space-y-4">
          {myJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => {
                setSelectedJob(job);
                setView("JOB_DETAIL");
              }}
              className="bg-white p-5 rounded-[32px] border-2 border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0 text-left">
                <div
                  className={`shrink-0 w-12 h-12 ${CATEGORIES.find((c) => c.id === job.category)?.color} rounded-2xl flex items-center justify-center text-white text-xl`}
                >
                  <i
                    className={`fa-solid ${CATEGORIES.find((c) => c.id === job.category)?.icon}`}
                  ></i>
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-900 text-sm leading-tight truncate">
                    {job.jobRole}
                  </h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 truncate">
                    {job.status === "APPROVED"
                      ? `${job.callCount} Calls Received`
                      : `Status: ${job.status.replace("_", " ")}`}
                  </p>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-slate-300"></i>
            </div>
          ))}
          {myJobs.length === 0 && (
            <div className="py-20 text-center opacity-40">
              <i className="fa-solid fa-clipboard-list text-6xl mb-4 text-slate-200"></i>
              <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">
                No jobs posted yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPostJob = () => (
    <div className="flex-1 flex flex-col bg-slate-50 relative h-full">
      <div className="px-6 pt-12 pb-6 bg-white border-b-2 border-slate-200 sticky top-0 z-20 flex justify-between items-center shadow-sm">
        <button
          title="Back to Home"
          onClick={() => setView("HOME")}
          className="w-11 h-11 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 active:scale-90 transition-all shadow-sm"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2 className="text-xl font-black text-slate-900">Post New Job</h2>
        <div className="w-11"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
        <section className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 text-left">
            Employer Details
          </p>
          <div className="bg-white border-2 border-slate-200 p-6 rounded-[32px] space-y-5 shadow-sm text-left">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                Your Name
              </label>
              <input
                title="Employer Name"
                className={`w-full bg-white border-2 rounded-2xl p-4 font-bold text-slate-700 focus:border-indigo-600 outline-none transition-all ${errors.firstName ? "border-red-500" : "border-slate-400"}`}
                value={postData.firstName}
                onChange={(e) =>
                  setPostData({ ...postData, firstName: e.target.value })
                }
              />
              {errors.firstName && (
                <p className="text-[8px] font-bold text-red-500 mt-1 uppercase px-1">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                Business Name
              </label>
              <input
                title=" Shop Name"
                className={`w-full bg-white border-2 rounded-2xl p-4 font-bold text-slate-700 focus:border-indigo-600 outline-none transition-all ${errors.shopName ? "border-red-500" : "border-slate-400"}`}
                value={postData.shopName}
                onChange={(e) =>
                  setPostData({ ...postData, shopName: e.target.value })
                }
              />
              {errors.shopName && (
                <p className="text-[8px] font-bold text-red-500 mt-1 uppercase px-1">
                  {errors.shopName}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4 text-left">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
            Contact Information
          </p>
          <div className="bg-white border-2 border-slate-200 p-6 rounded-[32px] space-y-5 shadow-sm">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                Call Number
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="10 digit mobile number"
                className={`w-full bg-white border-2 rounded-2xl p-4 font-bold text-slate-700 focus:border-indigo-600 outline-none transition-all ${errors.callNumber ? "border-red-500" : "border-slate-400"}`}
                value={postData.callNumber}
                onChange={(e) =>
                  setPostData({
                    ...postData,
                    callNumber: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
              {errors.callNumber && (
                <p className="text-[8px] font-bold text-red-500 mt-1 uppercase px-1">
                  {errors.callNumber}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 px-1 py-1">
              <input
                type="checkbox"
                id="same-whatsapp"
                className="w-5 h-5 rounded border-slate-400 accent-indigo-600 cursor-pointer"
                checked={postData.sameAsWhatsApp}
                onChange={(e) =>
                  setPostData({ ...postData, sameAsWhatsApp: e.target.checked })
                }
              />
              <label
                htmlFor="same-whatsapp"
                className="text-[10px] font-black text-slate-600 uppercase tracking-tight cursor-pointer"
              >
                WhatsApp is same as Call Number
              </label>
            </div>

            {!postData.sameAsWhatsApp && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                  Different WhatsApp Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="WhatsApp number"
                  className={`w-full bg-white border-2 rounded-2xl p-4 font-bold text-slate-700 focus:border-indigo-600 outline-none transition-all ${errors.whatsappNumber ? "border-red-500" : "border-slate-400"}`}
                  value={postData.whatsappNumber}
                  onChange={(e) =>
                    setPostData({
                      ...postData,
                      whatsappNumber: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
                {errors.whatsappNumber && (
                  <p className="text-[8px] font-bold text-red-500 mt-1 uppercase px-1">
                    {errors.whatsappNumber}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4 text-left">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
            Job Information
          </p>
          <div className="bg-white border-2 border-slate-200 p-6 rounded-[32px] space-y-5 shadow-sm">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                What is the Role? (e.g. Cook, Driver)
              </label>
              <input
                placeholder="Job Role Name"
                className={`w-full bg-white border-2 rounded-2xl p-4 font-bold text-slate-700 focus:border-indigo-600 outline-none transition-all ${errors.jobRole ? "border-red-500" : "border-slate-400"}`}
                value={postData.jobRole}
                onChange={(e) =>
                  setPostData({ ...postData, jobRole: e.target.value })
                }
              />
              {errors.jobRole && (
                <p className="text-[8px] font-bold text-red-500 mt-1 uppercase px-1">
                  {errors.jobRole}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                Job Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setPostData({ ...postData, category: cat.id })
                    }
                    className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${postData.category === cat.id ? `${cat.color} border-white text-white shadow-lg scale-105 z-10` : "bg-slate-50 border-slate-200 text-slate-400"}`}
                  >
                    <i className={`fa-solid ${cat.icon} text-sm`}></i>
                    <span className="text-[7px] font-black uppercase mt-1 text-center leading-tight">
                      {cat.label.split(" / ")[0]}
                    </span>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-[8px] font-bold text-red-500 mt-2 uppercase px-1">
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                Salary Details
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() =>
                    setPostData({ ...postData, salaryType: "DAY" })
                  }
                  className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase border-2 transition-all ${postData.salaryType === "DAY" ? "bg-indigo-600 border-indigo-700 text-white shadow-md" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                >
                  Per Day
                </button>
                <button
                  onClick={() =>
                    setPostData({ ...postData, salaryType: "MONTH" })
                  }
                  className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase border-2 transition-all ${postData.salaryType === "MONTH" ? "bg-indigo-600 border-indigo-700 text-white shadow-md" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                >
                  Per Month
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Amount"
                  className={`w-full bg-white border-2 rounded-2xl p-4 pl-10 font-black text-lg text-slate-700 focus:border-indigo-600 outline-none transition-all ${errors.salary ? "border-red-500" : "border-slate-400"}`}
                  value={postData.salaryAmount}
                  onChange={(e) =>
                    setPostData({ ...postData, salaryAmount: e.target.value })
                  }
                />
              </div>
              {errors.salary && (
                <p className="text-[8px] font-bold text-red-500 mt-1 uppercase px-1">
                  {errors.salary}
                </p>
              )}
            </div>

            {/* Required Experience */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">
                Required Experience
              </label>

              <select
                title="Experience level"
                value={postData.minExperienceYears ?? 0}
                onChange={(e) =>
                  setPostData({
                    ...postData,
                    minExperienceYears: Number(e.target.value),
                  })
                }
                className="w-full border rounded-xl p-3 font-bold"
              >
                <option value={0}>Entry level OK</option>
                <option value={1}>1–2 years</option>
                <option value={3}>3+ years</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4 pb-24 text-left">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
            Workplace Details
          </p>
          <div className="bg-white border-2 border-slate-200 p-6 rounded-[32px] space-y-5 shadow-sm">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                Work Address
              </label>
              <textarea
                placeholder="Full address of the shop/site"
                className={`w-full bg-white border-2 rounded-2xl p-4 font-bold text-slate-700 focus:border-indigo-600 outline-none min-h-[80px] transition-all ${errors.location ? "border-red-500" : "border-slate-400"}`}
                value={postData.location?.address || ""}
                onChange={(e) =>
                  setPostData({
                    ...postData,
                    location: {
                      lat: 0,
                      lng: 0,
                      address: e.target.value,
                      source: "MANUAL",
                    },
                  })
                }
              />
              {errors.location && (
                <p className="text-[8px] font-bold text-red-500 mt-1 uppercase px-1">
                  {errors.location}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                Workplace Photo
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-video w-full rounded-2xl border-4 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-y-auto
 ${postData.shopPhoto ? "border-emerald-500 bg-emerald-50" : "border-slate-400 bg-slate-50 hover:border-indigo-400"}`}
              >
                {postData.shopPhoto ? (
                  <img
                    src={postData.shopPhoto.url}
                    className="w-full h-full object-cover"
                    alt="Workplace"
                  />
                ) : (
                  <>
                    <i className="fa-solid fa-camera text-2xl text-slate-300 mb-2"></i>
                    <span className="text-[9px] font-black uppercase text-slate-500">
                      Add Workplace Photo
                    </span>
                  </>
                )}
              </div>
              <input
                title="Shop Photo"
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </section>

        <section className="pb-20">
          <button
            title="Verification"
            onClick={handleStartPosting}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-100 active:scale-95 transition-all border-b-4 border-indigo-800"
          >
            Verify & Preview
          </button>
        </section>
      </div>

      {isVerifyingOtp && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xs rounded-[40px] p-8 shadow-2xl text-center">
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Verify Identity
            </h3>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-8">
              Code sent to +91 {postData.callNumber}
            </p>
            <div className="flex justify-center gap-2 mb-8">
              {otpValue.map((d, i) => (
                <input
                  title="OTP Digit"
                  key={i}
                  id={`otp-${i}`}
                  className="w-10 h-14 bg-white border-2 border-slate-400 rounded-xl text-center text-xl font-black focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none shadow-md transition-all"
                  value={d}
                  maxLength={1}
                  onChange={(e: any) => {
                    const n = [...otpValue];
                    n[i] = e.target.value.slice(-1);
                    setOtpValue(n);
                    if (e.target.value && i < 5)
                      document.getElementById(`otp-${i + 1}`)?.focus();
                  }}
                />
              ))}
            </div>
            {errors.otp && (
              <p className="text-red-500 text-[10px] font-black mb-4 uppercase">
                {errors.otp}
              </p>
            )}
            <button
              onClick={handleVerifyOtp}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {isReviewing && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div
            className="bg-white w-full max-w-md rounded-[40px] flex flex-col max-h-[90vh] overflow-y-auto
 shadow-2xl"
          >
            <div className="p-6 border-b-2 border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900">Job Preview</h2>
              <button
                title="Go back"
                aria-label="Go back"
                onClick={() => setIsReviewing(false)}
                className="w-10 h-10 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-400 shadow-sm"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar text-left">
              <div className="bg-slate-50 border-2 border-slate-300 rounded-[32px] p-6 space-y-4 shadow-inner">
                <div className="flex justify-between border-b-2 border-slate-200 pb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase">
                    Employer
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {postData.firstName}
                  </span>
                </div>
                <div className="flex justify-between border-b-2 border-slate-200 pb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase">
                    Business
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {postData.shopName}
                  </span>
                </div>
                <div className="flex justify-between border-b-2 border-slate-200 pb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase">
                    Role
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {postData.jobRole}
                  </span>
                </div>
                <div className="flex justify-between border-b-2 border-slate-200 pb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase">
                    Salary
                  </span>
                  <span className="text-sm font-black text-indigo-600">
                    ₹{postData.salaryAmount} / {postData.salaryType}
                  </span>
                </div>
                <div className="flex justify-between border-b-2 border-slate-200 pb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase">
                    Call Number
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {postData.callNumber}
                  </span>
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase mb-1">
                    Location
                  </span>
                  <p className="text-xs font-bold text-slate-700 leading-snug">
                    {postData.location?.address}
                  </p>
                </div>
                {postData.shopPhoto && (
                  <div className="pt-2">
                    <img
                      src={postData.shopPhoto.url}
                      className="w-full h-32 object-cover rounded-2xl border-2 border-slate-400 shadow-sm"
                      alt="Preview"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t-2 border-slate-200 bg-slate-50">
              <button
                onClick={handleFinalSubmit}
                disabled={isPosting}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all border-b-4 border-indigo-800"
              >
                {isPosting ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  "Final Post Job"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSuccess = () => (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-500 h-screen w-full">
      <div className="w-24 h-24 bg-emerald-100 border-4 border-emerald-200 text-emerald-500 rounded-full flex items-center justify-center mb-8 text-4xl shadow-xl shadow-emerald-50">
        <i className="fa-solid fa-shield-halved"></i>
      </div>
      <h2 className="text-3xl font-black text-slate-900 leading-tight">
        Job Submitted!
      </h2>
      <p className="text-slate-500 text-xs font-bold leading-relaxed mt-4 px-10 uppercase tracking-widest">
        Our admin team is verifying your details. Your job will be live for
        local workers after approval.
      </p>
      <button
        onClick={() => setView("HOME")}
        className="mt-12 w-full max-w-xs py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
      >
        Back to Home
      </button>
    </div>
  );

  return (
    <div
      className="flex-1 h-full flex flex-col bg-slate-50 overflow-y-auto
 relative"
    >
      {view === "HOME" && renderHome()}
      {view === "POST_JOB" && renderPostJob()}
      {view === "SUCCESS" && renderSuccess()}

      {view === "HOME" && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full px-6 flex justify-center z-30 pointer-events-none">
          {/* Keeping button hidden here as it moved to header, but retaining structure if needed */}
        </div>
      )}

      {view === "MATCHING_WORKERS" && (
        <MatchingWorkersView
          workers={matchingWorkers}
          onAudioToggle={handleAudioToggle}
          playingAudioId={playingAudioId}
        />
      )}

      {view === "JOB_DETAIL" && selectedJob && (
        <EmployerJobDetail
          job={selectedJob}
          onBack={() => setView("HOME")}
          onDeleteJob={async (id) => {
            await onDeleteJob(id);
            setView("HOME");
          }}
          onEdit={(job) => {
            setPostData({
              firstName: job.employerFirstName || "",
              shopName: job.shopName || "",
              jobRole: job.jobRole || "",
              category: job.category,
              description: job.description || "",
              callNumber: job.contact.callNumber,
              whatsappNumber: job.contact.whatsappNumber,
              sameAsWhatsApp: true,
              salaryAmount: job.salaryAmount,
              salaryType: job.salaryType,
              minExperienceYears: job.minExperienceYears || 0,
              location: job.location,
              shopPhoto: job.shopPhoto,
            });

            setSelectedJob(job); // store editing target
            setView("POST_JOB"); // reuse same form
          }}
        />
      )}

      {view === "PROMOTE" && (
        <EmployerPromoteView
          jobs={myJobs}
          onPromote={(job) => {
            setSelectedJob(job);
            setView("PROMOTE_JOB"); // or PROMOTE_DETAIL
          }}
        />
      )}

      {view === "PROMOTE_JOB" && selectedJob && (
        <PromoteJobView
          job={selectedJob}
          plans={promotionPlans}
          onBack={() => setView("PROMOTE")}
          onBuy={(planId) => handlePromote(selectedJob.id, planId)}
        />
      )}

      {employerProfile && (
        <EmployerProfileDrawer
          isOpen={mustCompleteEmployerProfile || isEmployerProfileOpen}
          isMandatory={mustCompleteEmployerProfile}
          profile={employerProfile}
          onClose={() => {
            setIsEmployerProfileOpen(false);
            setActiveTab("HOME");
          }}
          onSave={(updatedProfile) => {
            setEmployerProfile(updatedProfile);
            localStorage.setItem(
              `nearbykaam_employer_profile_${updatedProfile.phone}`,
              JSON.stringify(updatedProfile),
            );
            setIsEmployerProfileOpen(false);
          }}
        />
      )}
      <EmployerBottomNav
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab)}
      />
    </div>
  );
};

export default EmployerView;
