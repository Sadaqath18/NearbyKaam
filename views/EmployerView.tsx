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
import { CATEGORIES } from "../constants";
import { EmployerProfile } from "../types";
import { createEmptyEmployerProfile } from "../utils/employerProfile";
import EmployerProfileDrawer from "../components/EmployerProfileDrawer";
import { useLanguage } from "../context/LanguageContext";

interface EmployerViewProps {
  onJobSubmit: (job: Job) => void;
  allJobs: Job[];
  onChangeLanguage: () => void;
  currentUser: User | null;
  onLogout: () => void;
}

const MOCK_APPLICANTS: WorkerProfile[] = [
  {
    name: "Rajesh Kumar",
    phone: "9876543221",
    jobType: JobCategory.HOTEL,
    preferredJobTitle: "Assistant Cook",
    expectedSalary: 18000,
    location: { lat: 19.076, lng: 72.8777, address: "Andheri West" },
    resume: {
      hasAudio: true,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      hasDocument: true,
      documentName: "Rajesh_Resume.pdf",
      documentUrl: "#",
    },
    createdAt: new Date().toISOString(),
  },
];

const EmployerView: React.FC<EmployerViewProps> = ({
  onJobSubmit,
  allJobs,
  onChangeLanguage,
  currentUser,
  onLogout,
}) => {
  const { language } = useLanguage();
  const [employerProfile, setEmployerProfile] =
    useState<EmployerProfile | null>(null);

  const [view, setView] = useState<
    "DASHBOARD" | "POST_JOB" | "APPLICANTS" | "SUCCESS"
  >("DASHBOARD");
  useEffect(() => {
    if (!currentUser?.phone) return;

    const key = `nearbykaam_employer_profile_${currentUser.phone}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      setEmployerProfile(JSON.parse(saved));
    } else {
      const fresh = createEmptyEmployerProfile(currentUser.phone);
      localStorage.setItem(key, JSON.stringify(fresh));
      setEmployerProfile(fresh);
    }
  }, [currentUser?.phone]);

  const [isReviewing, setIsReviewing] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isEmployerProfileOpen, setIsEmployerProfileOpen] = useState(false);

  const [postData, setPostData] = useState({
    firstName: "",
    shopName: "",
    industry: "",
    jobRole: "",
    category: undefined as JobCategory | undefined,
    description: "",
    callNumber: currentUser?.phone || "",
    whatsappNumber: currentUser?.phone || "",
    sameAsWhatsApp: true,
    salaryAmount: "",
    salaryType: "DAY" as SalaryType,
    location: null as Location | null,
    shopPhoto: null as ShopPhoto | null,
  });

  useEffect(() => {
    if (!employerProfile) return;

    setPostData((prev) => ({
      ...prev,
      firstName: employerProfile.firstName,
      shopName: employerProfile.shopName,
      industry: employerProfile.industry,
      location: employerProfile.location || null,
    }));
  }, [employerProfile]);

  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedJobForApplicants, setSelectedJobForApplicants] =
    useState<Job | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const myJobs = allJobs.filter(
    (j) => j.employerId === "me" || j.contact.callNumber === currentUser?.phone,
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

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!postData.firstName.trim()) e.firstName = "Name required";
    if (!postData.shopName.trim()) e.shopName = "Business name required";
    if (!postData.jobRole.trim()) e.jobRole = "Job title required";
    if (!postData.category) e.category = "Category required";
    if (!postData.salaryAmount || isNaN(Number(postData.salaryAmount)))
      e.salary = "Valid amount required";
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

  const handleStartPosting = () => {
    if (validateForm()) {
      setErrors({});
      setIsVerifyingOtp(true);
    }
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
          ownerName: postData.firstName,
          shopName: postData.shopName,
          industry: postData.industry as JobCategory,
          location: postData.location ?? employerProfile.location,
        };

        localStorage.setItem(
          `nearbykaam_employer_profile_${employerProfile.phone}`,
          JSON.stringify(updatedProfile),
        );

        setEmployerProfile(updatedProfile);
      }

      onJobSubmit({
        id: Math.random().toString(36).substr(2, 9),
        title: postData.jobRole,
        jobRole: postData.jobRole,
        category: postData.category || JobCategory.OTHER,
        industry: postData.industry || "Other",
        employerFirstName: postData.firstName,
        employerId: "me",
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
        isVerified: false,
        isPromoted: false,
        status: "PENDING_APPROVAL",
        isLive: false,
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

  const renderDashboard = () => (
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
            <button
              title="Edit employer profile"
              aria-label="Edit employer profile"
              onClick={() => setIsEmployerProfileOpen(true)}
              className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all"
            >
              <i className="fa-solid fa-user-gear"></i>
            </button>

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
                setSelectedJobForApplicants(job);
                setView("APPLICANTS");
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
          title="Back to Dashboard"
          onClick={() => setView("DASHBOARD")}
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
                className={`aspect-video w-full rounded-2xl border-4 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${postData.shopPhoto ? "border-emerald-500 bg-emerald-50" : "border-slate-400 bg-slate-50 hover:border-indigo-400"}`}
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
          <div className="bg-white w-full max-w-md rounded-[40px] flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
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
        onClick={() => setView("DASHBOARD")}
        className="mt-12 w-full max-w-xs py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
      >
        Back to Dashboard
      </button>
    </div>
  );

  const renderApplicants = () => (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="px-6 pt-12 pb-6 flex justify-between items-center bg-white border-b-2 border-slate-200 sticky top-0 z-10 shadow-sm">
        <button
          title="Back"
          onClick={() => setView("DASHBOARD")}
          className="w-11 h-11 rounded-2xl bg-slate-50 border-2 border-slate-400 flex items-center justify-center text-slate-500 active:scale-90 transition-transform shadow-sm"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="text-center">
          <h2 className="text-lg font-black text-slate-900">Applicants</h2>
          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
            {selectedJobForApplicants?.jobRole}
          </p>
        </div>
        <div className="w-11"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {MOCK_APPLICANTS.map((applicant, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-[40px] shadow-sm border-2 border-slate-100 space-y-6 animate-in slide-in-from-bottom-4 duration-300 text-left"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-14 h-14 bg-orange-100 border border-orange-200 text-orange-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                  {applicant.name[0]}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">
                    {applicant.name}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    {applicant.preferredJobTitle}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-indigo-600 font-black text-base">
                  ₹{applicant.expectedSalary}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-5 rounded-3xl border-2 border-slate-100 space-y-4 shadow-inner">
              {applicant.resume.hasAudio && (
                <button
                  onClick={() =>
                    handleAudioToggle(
                      applicant.resume.audioUrl!,
                      `audio-${idx}`,
                    )
                  }
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm border-2 ${playingAudioId === `audio-${idx}` ? "bg-orange-600 text-white border-orange-700" : "bg-white border-orange-200 text-orange-600"}`}
                >
                  <i
                    className={`fa-solid ${playingAudioId === `audio-${idx}` ? "fa-stop" : "fa-play"}`}
                  ></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Play Voice Intro
                  </span>
                </button>
              )}
              <div className="flex items-center gap-2 text-slate-500">
                <i className="fa-solid fa-location-dot text-[10px] text-indigo-400"></i>
                <span className="text-[10px] font-bold">
                  {applicant.location?.address}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`tel:${applicant.phone}`}
                className="bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-[10px] uppercase tracking-widest border-b-4 border-slate-700"
              >
                <i className="fa-solid fa-phone"></i> Call
              </a>
              <a
                href={`https://wa.me/91${applicant.phone}`}
                className="bg-emerald-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-[10px] uppercase tracking-widest border-b-4 border-emerald-700"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i> WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-50 overflow-hidden relative">
      {view === "DASHBOARD" && renderDashboard()}
      {view === "POST_JOB" && renderPostJob()}
      {view === "APPLICANTS" && renderApplicants()}
      {view === "SUCCESS" && renderSuccess()}

      {view === "DASHBOARD" && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full px-6 flex justify-center z-30 pointer-events-none">
          {/* Keeping button hidden here as it moved to header, but retaining structure if needed */}
        </div>
      )}
      {employerProfile && (
        <EmployerProfileDrawer
          isOpen={isEmployerProfileOpen}
          isMandatory={false}
          profile={employerProfile}
          onClose={() => setIsEmployerProfileOpen(false)}
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
    </div>
  );
};

export default EmployerView;
