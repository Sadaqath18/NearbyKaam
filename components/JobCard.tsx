import React, { useState } from "react";
import { Job, WorkerProfile } from "../types";
import { CATEGORIES, LANGUAGES } from "../constants";
import {
  speakText,
  stopSpeaking,
  getJobReadoutText,
} from "../services/geminiService";

interface JobCardProps {
  job: Job;
  onReport: (id: string) => void;
  language: string;
  isCompact?: boolean;
  isGuest?: boolean;
  onAuthRequired?: () => void;
  workerProfile?: WorkerProfile;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onReport,
  language,
  isCompact = false,
  isGuest = false,
  onAuthRequired,
  workerProfile,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const categoryInfo =
    CATEGORIES.find((c) => c.id === job.category) ||
    CATEGORIES[CATEGORIES.length - 1];
  const displayRole =
    job.jobRole || (job.industry ? "General Worker" : job.title);

  const postedDate = new Date(job.createdAt);
  const now = new Date();
  const isToday = postedDate.toDateString() === now.toDateString();

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
      onAuthRequired?.();
      return;
    }
    window.location.href = `tel:${job.contact.callNumber}`;
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
      onAuthRequired?.();
      return;
    }
    const message = `Namaste, I found your job "${displayRole}" on NearbyKaam. Is it available?`;
    window.location.href = `https://wa.me/${job.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `🔍 New Job Found on NearbyKaam!\n\n📌 Role: ${displayRole}\n🏢 Company: ${job.employerName}\n📍 Location: ${job.location.address}\n💰 Salary: ₹${job.ount} per ${job.salaryType === "DAY" ? "Day" : "Month"}\n\nCheck it out here: https://nearbykaam.in/jobs/${job.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Job: ${displayRole}`,
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      } catch (err) {
        console.error("Failed to copy!", err);
      }
    }
  };

  const handleVoiceDesc = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking || isThinking) {
      stopSpeaking();
      setIsSpeaking(false);
      setIsThinking(false);
      return;
    }
    setIsThinking(true);
    try {
      const langName =
        LANGUAGES.find((l) => l.code === language)?.name || "English";
      const script = await getJobReadoutText(job, langName);
      setIsThinking(false);
      setIsSpeaking(true);
      await speakText(script, language);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpeaking(false);
      setIsThinking(false);
    }
  };

  if (isCompact) {
    return (
      <div className="w-44 bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex flex-col gap-2 shrink-0 active:scale-95 transition-transform">
        <div
          className={`${categoryInfo.color} w-full h-20 rounded-xl flex items-center justify-center text-white text-xl`}
        >
          <i className={`fa-solid ${categoryInfo.icon}`}></i>
        </div>
        <h4 className="font-black text-slate-900 text-[10px] truncate leading-tight uppercase">
          {displayRole}
        </h4>
        <p className="text-indigo-600 font-black text-xs">₹{job.ount}</p>
      </div>
    );
  }

  const getTimeAgo = (dateStr: string) => {
    const posted = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - posted.getTime()) / (1000 * 60 * 60)
    );
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`bg-white rounded-[32px] border transition-all duration-300 cursor-pointer overflow-hidden relative ${isExpanded ? "border-indigo-600 shadow-xl" : "border-slate-100 shadow-sm active:scale-[0.98]"}`}
    >
      {showCopiedToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2">
          Link Copied!
        </div>
      )}

      <div className="p-6">
        <div className="flex gap-4 items-start">
          <div className="shrink-0">
            {job.shopPhoto ? (
              <img
                src={job.shopPhoto.url}
                className="w-16 h-16 object-cover rounded-2xl border border-slate-100 shadow-sm"
                alt="Shop Photo"
              />
            ) : (
              <div
                className={`${categoryInfo.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl shadow-sm`}
              >
                <i className={`fa-solid ${categoryInfo.icon}`}></i>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                <h3 className="font-black text-slate-900 text-base leading-none truncate">
                  {displayRole}
                </h3>
                {job.isVerified && (
                  <i
                    className="fa-solid fa-circle-check text-blue-500 text-sm shrink-0"
                    title="Verified Employer"
                  ></i>
                )}
                <button
                  onClick={handleVoiceDesc}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${isSpeaking ? "bg-orange-500 text-white shadow-md shadow-orange-100 scale-110" : "bg-slate-50 text-slate-400 active:scale-90 hover:bg-slate-100"}`}
                  aria-label="Listen to job details"
                >
                  <i
                    className={`fa-solid ${isThinking ? "fa-spinner fa-spin" : isSpeaking ? "fa-stop" : "fa-volume-high"} text-[10px]`}
                  ></i>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={handleShare}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-indigo-600 active:scale-90 transition-all"
                  title="Share Job"
                >
                  <i className="fa-solid fa-share-nodes text-sm"></i>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-indigo-600 active:scale-90 transition-all"
                  title="Bookmark Job"
                >
                  <i className="fa-regular fa-bookmark"></i>
                </button>
              </div>
            </div>

            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest truncate mb-3">
              {job.employerName} • {job.location.address}
            </p>

            <div className="flex flex-wrap gap-2">
              {isToday && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-tight">
                  Posted Today
                </span>
              )}
              <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-tight">
                {job.employmentType || "Full Time"}
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-tight">
                {job.distance || "..."} KM
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-indigo-600 font-black text-sm">
              ₹{job.salaryAmount} / {job.salaryType === "DAY" ? "Day" : "Mo"}
            </span>
            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
              • {getTimeAgo(job.createdAt)}
            </span>
          </div>
          {job.isVerified && (
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full">
              <i className="fa-solid fa-shield-halved text-[9px] text-blue-500"></i>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-tight">
                Trusted
              </span>
            </div>
          )}
        </div>

        {/* EXPANDED CONTENT */}
        <div
          className={`overflow-hidden transition-all duration-500 ${isExpanded ? "max-h-[800px] mt-6 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <i className="fa-solid fa-file-lines"></i> About the job
              </h4>
              <div className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100 relative">
                {job.description ||
                  "No specific details provided. Contact the employer for full job requirements and timings."}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Work Mode
                </p>
                <p className="text-[10px] font-bold text-slate-700">
                  {job.workMode || "On-site"}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Experience
                </p>
                <p className="text-[10px] font-bold text-slate-700">
                  {job.experienceLevel || "Entry Level"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCall}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                <i className="fa-solid fa-phone-volume text-base text-indigo-400"></i>{" "}
                Call Employer
              </button>
              <button
                onClick={handleWhatsApp}
                className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-emerald-50"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Chat on WhatsApp
                </span>
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onReport(job.id);
              }}
              className="w-full py-3 text-[9px] font-black text-red-400 uppercase flex items-center justify-center gap-2 active:text-red-600 transition-colors"
            >
              <i className="fa-solid fa-flag"></i> Report this job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
