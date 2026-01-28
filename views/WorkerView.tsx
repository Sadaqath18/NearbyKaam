import React, { useState, useEffect, useMemo, useRef } from "react";
import { Job, JobCategory, Location, WorkerProfile, User } from "../types";
import CategoryGrid from "../components/CategoryGrid";
import JobCard from "../components/JobCard";
import WorkerProfileDrawer from "../components/WorkerProfileDrawer";
import { STATES_AND_CITIES, LANGUAGES } from "../constants";
import { GoogleGenAI } from "@google/genai";
import { parseJobSearch, speakText } from "../services/geminiService";
import { JOB_CATEGORY_LABELS } from "../i18n/jobCategories";
import { matchCategoryFromSpeech } from "../utils/voiceCategoryMatcher";
import { useLanguage } from "../context/LanguageContext";
import.meta.env.VITE_GEMINI_API_KEY;

interface WorkerViewProps {
  jobs: Job[];
  onReport: (id: string) => void;
  onChangeLanguage: () => void;
  isGuest: boolean;
  currentUser: User | null;
  onProfileCompleted: () => void;
  onAuthRequired: () => void;
  onLogout: () => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
}

const DISTANCE_OPTIONS = [1, 2, 5, 10, 20, 30];
const EXPERIENCE_OPTIONS = ["All", "Entry Level", "1-2 Years", "3+ Years"];

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return parseFloat(
    (R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))).toFixed(1),
  );
}

const WorkerView: React.FC<WorkerViewProps> = ({
  jobs: allJobs,
  onReport,
  onChangeLanguage,
  isGuest,
  currentUser,
  onProfileCompleted,
  onAuthRequired,
  onLogout,
  isProfileOpen,
  setIsProfileOpen,
}) => {
  const [viewState, setViewState] = useState<"INDUSTRY_SELECT" | "JOB_FEED">(
    "INDUSTRY_SELECT",
  );
  const [userLocation, setUserLocation] = useState<Location | null>(() => {
    const saved = localStorage.getItem("nearbykaam_loc");
    return saved ? JSON.parse(saved) : null;
  });

  const { language } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<
    JobCategory | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const getEmptyWorkerProfile = (phone: string): WorkerProfile => ({
    phone,
    name: "",
    email: "",
    preferredJobTitle: "",
    jobType: "" as unknown as JobCategory,
    expectedSalary: undefined,
    expectedSalaryType: undefined,
    location: undefined,
    resume: {
      hasAudio: false,
      hasDocument: false,
      audioUrl: null,
      documentUrl: null,
      documentName: null,
    },
    createdAt: new Date().toISOString(),
  });

  const [profile, setProfile] = useState<WorkerProfile>(() => {
    if (!currentUser?.phone) {
      return getEmptyWorkerProfile("");
    }

    const saved = localStorage.getItem(
      `nearbykaam_worker_profile_${currentUser.phone}`,
    );

    return saved ? JSON.parse(saved) : getEmptyWorkerProfile(currentUser.phone);
  });

  useEffect(() => {
    if (!currentUser?.phone) return;

    const saved = localStorage.getItem(
      `nearbykaam_worker_profile_${currentUser.phone}`,
    );

    setProfile(
      saved ? JSON.parse(saved) : getEmptyWorkerProfile(currentUser.phone),
    );
  }, [currentUser?.phone]);

  useEffect(() => {
    if (!userLocation && "geolocation" in navigator) {
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      const handleSuccess = (pos: GeolocationPosition) => {
        const loc: Location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: "Current Location",
          source: "GPS" as const,
        };
        setUserLocation(loc);
        localStorage.setItem("nearbykaam_loc", JSON.stringify(loc));
      };

      const handleError = (error: GeolocationPositionError) => {
        const fallback: Location = {
          lat: 19.076,
          lng: 72.8777,
          address: "Mumbai Area (Network Fallback)",
          source: "NETWORK" as const,
        };
        setUserLocation(fallback);
        localStorage.setItem("nearbykaam_loc", JSON.stringify(fallback));
      };

      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        geoOptions,
      );
    }
  }, []);

  const LANG_TO_LOCALE: Record<string, string> = {
    en: "en-IN",
    hi: "hi-IN",
    ta: "ta-IN",
    te: "te-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    mr: "mr-IN",
    ur: "ur-IN",
    gu: "gu-IN",
    bn: "bn-IN",
    pa: "pa-IN",
    or: "or-IN",
    as: "as-IN",
    ne: "ne-IN",
    ks: "ur-IN",
    sd: "ur-IN",
  };

  // VOICE CATEGORY HANDLER
  const handleVoiceCategory = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_TO_LOCALE[language] ?? "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus(language === "hi" ? "सुन रहा हूँ..." : "Listening...");
    };

    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript.toLowerCase();

      const matchedCategory = matchCategoryFromSpeech(spokenText, language);

      if (matchedCategory) {
        setSelectedCategory(matchedCategory);

        const label =
          JOB_CATEGORY_LABELS[matchedCategory].labels[language] ??
          JOB_CATEGORY_LABELS[matchedCategory].labels.en;

        speakText(label, language);

        setTimeout(() => {
          setViewState("JOB_FEED");
        }, 400);
      } else {
        speakText(
          language === "hi"
            ? "श्रेणी समझ नहीं आई"
            : "Sorry, I didn’t understand",
          language,
        );
      }

      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      speakText(
        language === "hi" ? "दोबारा बोलिए" : "Please try again",
        language,
      );
    };

    recognition.start();
  };

  const handleIndustrySelect = (cat: JobCategory) => {
    setSelectedCategory(cat);
    setViewState("JOB_FEED");
  };

  const processedJobs = useMemo(() => {
    let list = allJobs.filter(
      (j) => j.status === "APPROVED" && j.isLive === true,
    );

    if (userLocation) {
      list = list.map((job) => ({
        ...job,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          job.location.lat,
          job.location.lng,
        ),
      }));
      list = list.filter((j) => (j.distance || 0) <= maxDistance);
    }

    if (selectedCategory && selectedCategory !== JobCategory.OTHER) {
      list = list.filter((j) => j.category === selectedCategory);
    }

    if (selectedExperience !== "All") {
      list = list.filter((j) => {
        if (!j.experienceLevel) return false;
        if (selectedExperience === "Entry Level") {
          return ["Entry Level", "Fresher", "No Experience"].includes(
            j.experienceLevel,
          );
        }
        if (selectedExperience === "3+ Years") {
          return ["3+ Years", "Senior", "5+ Years"].includes(j.experienceLevel);
        }
        return j.experienceLevel === selectedExperience;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((j) => {
        const text =
          `${j.title} ${j.description} ${j.employerName} ${j.jobRole}`.toLowerCase();
        return text.includes(q);
      });
    }

    list.sort((a, b) => {
      const distA = a.distance || 9999;
      const distB = b.distance || 9999;
      if (Math.abs(distA - distB) > 0.1) return distA - distB;
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [
    allJobs,
    userLocation,
    selectedCategory,
    searchQuery,
    maxDistance,
    selectedExperience,
  ]);

  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus("Listening...");
      setInterimTranscript("");
    };

    recognition.onresult = async (event: any) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(finalTranscript || interim);

      if (finalTranscript) {
        setVoiceStatus("Thinking...");
        try {
          const langName =
            LANGUAGES.find((l) => l.code === language)?.name || "English";
          const filters = await parseJobSearch(finalTranscript, langName);

          if (filters.category) setSelectedCategory(filters.category);
          if (filters.keyword) setSearchQuery(filters.keyword);

          setVoiceStatus(filters.intentSummary);
          setTimeout(() => {
            setIsListening(false);
            setInterimTranscript("");
          }, 1500);
        } catch (err) {
          setVoiceStatus("Try again");
          setTimeout(() => setIsListening(false), 1500);
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceStatus("Error");
    };

    recognition.start();
  };

  const handleManualLocationSelect = async (city: string) => {
    try {
      const ai = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find lat/lng for city: "${city}, India". Return ONLY JSON: {"lat": number, "lng": number, "address": "City Name"}`,
        config: { responseMimeType: "application/json" },
      });
      const data = JSON.parse(response.text || "{}");
      if (data.lat && data.lng) {
        const newLoc: Location = {
          lat: data.lat,
          lng: data.lng,
          address: data.address || city,
          source: "MANUAL" as const,
        };
        setUserLocation(newLoc);
        localStorage.setItem("nearbykaam_loc", JSON.stringify(newLoc));
        setIsLocationPickerOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = (p: WorkerProfile) => {
    setProfile(p);
    localStorage.setItem(
      `nearbykaam_worker_profile_${p.phone}`,
      JSON.stringify(p),
    );
    onProfileCompleted();
    setIsProfileOpen(false);
  };

  if (viewState === "INDUSTRY_SELECT") {
    return (
      <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
        <button
          title="Tap and speak category"
          onClick={handleVoiceCategory}
          className="w-12 h-12 bg-white/20 rounded-full flex items-center
             justify-center text-white animate-pulse active:scale-95"
        >
          <i className="fa-solid fa-microphone"></i>
        </button>

        <WorkerProfileDrawer
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={profile}
          onSave={handleSaveProfile}
          onChangeLanguage={onChangeLanguage}
          isMandatory={
            currentUser?.isAuthenticated && !currentUser.profileCompleted
          }
        />
        <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
          <div className="bg-orange-500 px-6 pt-6 pb-8 rounded-b-[48px] shadow-lg z-20">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-black text-white leading-none">
                NearbyKaam
              </h1>

              <div className="flex items-center gap-3">
                <button
                  title="Tap and speak category"
                  onClick={handleVoiceCategory}
                  className={`w-10 h-10 rounded-full flex items-center justify-center
    ${
      isListening
        ? "bg-white text-orange-500 animate-pulse"
        : "bg-white/20 text-white"
    }`}
                >
                  <i className="fa-solid fa-microphone"></i>
                </button>
                <button
                  title="Switch display language"
                  onClick={onChangeLanguage}
                  className="w-10 h-10 bg-white/20 rounded-[15px] flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                  <i className="fa-solid fa-globe"></i>
                </button>
                <button
                  title={isGuest ? "Exit guest view" : "Sign out from account"}
                  onClick={onLogout}
                  className="w-10 h-10 bg-white/20 rounded-[15px] border border-white/30 flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            </div>
            <div className="text-white/80 text-xs font-bold uppercase tracking-widest px-2">
              Select Category to Start
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-10 no-scrollbar">
            <CategoryGrid
              onSelect={handleIndustrySelect}
              selected={selectedCategory}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative animate-in slide-in-from-right-10 duration-300">
      <WorkerProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
        onChangeLanguage={onChangeLanguage}
      />

      <div className="px-6 pt-14 pb-4 bg-white sticky top-0 z-40 border-b border-slate-50 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <button
            title="Change industry filter"
            onClick={() => setViewState("INDUSTRY_SELECT")}
            className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
          >
            <i className="fa-solid fa-chevron-left text-sm"></i>
          </button>
          <div className="flex items-center gap-3">
            <button
              title={isGuest ? "Exit browse mode" : "Logout account"}
              onClick={onLogout}
              className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 active:bg-slate-100 transition-colors"
            >
              <i className="fa-solid fa-right-from-bracket text-xs"></i>
            </button>
            <button
              title="Switch app language"
              onClick={onChangeLanguage}
              className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 active:bg-slate-100 transition-colors"
            >
              <i className="fa-solid fa-globe text-xs"></i>
            </button>

            <button
              title="View your profile and resume"
              onClick={() => setIsProfileOpen(true)}
              className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm active:scale-90 transition-transform"
            >
              {profile.name ? profile.name[0].toUpperCase() : "U"}
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-6">
          Let's Find Job
        </h1>

        <div className="space-y-3">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-4 py-1">
            <i className="fa-solid fa-magnifying-glass text-slate-300 mr-3 text-sm"></i>
            <input
              type="text"
              title="Type here to search jobs"
              placeholder="e.g. Driver, Waiter, Guard"
              className="flex-1 bg-transparent py-3.5 text-sm font-medium outline-none text-slate-700 placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              title="Search by speaking"
              onClick={startVoiceSearch}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? "bg-orange-500 text-white animate-pulse"
                  : "text-slate-300 active:text-indigo-600"
              }`}
            >
              <i className="fa-solid fa-microphone"></i>
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-4 py-1">
            <i className="fa-solid fa-location-dot text-indigo-400 mr-3 text-sm"></i>
            <input
              type="text"
              readOnly
              onClick={() => setIsLocationPickerOpen(true)}
              placeholder="Search by area or city"
              className="flex-1 bg-transparent py-3.5 text-sm font-medium outline-none cursor-pointer text-slate-700 placeholder:text-slate-300"
              value={userLocation?.address || ""}
              title="Select or change your work location"
            />
            <button
              title="Open location filter"
              onClick={() => setIsLocationPickerOpen(true)}
              className="text-slate-300 ml-2 p-1 active:text-indigo-600"
            >
              <i className="fa-solid fa-chevron-down text-[10px]"></i>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {EXPERIENCE_OPTIONS.map((exp) => (
              <button
                key={exp}
                title={`Only show ${exp} jobs`}
                onClick={() => setSelectedExperience(exp)}
                className={`shrink-0 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                  selectedExperience === exp
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 active:bg-slate-50"
                }`}
              >
                {exp}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar bg-white">
        <div className="flex justify-between items-center mb-6 mt-6">
          <h2 className="font-black text-slate-900 text-sm uppercase tracking-tighter">
            Recommended jobs
          </h2>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {processedJobs.length} Results
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {processedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onReport={onReport}
              language={language}
              isGuest={isGuest}
              onAuthRequired={onAuthRequired}
            />
          ))}

          {processedJobs.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-6 text-slate-200">
                <i className="fa-solid fa-magnifying-glass text-3xl"></i>
              </div>
              <p className="font-black uppercase text-xs text-slate-400 tracking-widest leading-relaxed px-10">
                No jobs matching your criteria. Try changing filters.
              </p>
              <button
                title="Remove all search and distance filters"
                onClick={() => {
                  setSelectedExperience("All");
                  setMaxDistance(30);
                  setSearchQuery("");
                }}
                className="mt-8 text-indigo-600 font-black text-[10px] uppercase tracking-widest border-b-2 border-indigo-100 active:text-indigo-800"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {isListening && (
        <div className="fixed inset-0 z-[600] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-300">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-orange-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl shadow-2xl relative z-10 animate-bounce">
              <i className="fa-solid fa-microphone"></i>
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
            {voiceStatus}
          </h2>
          <p className="text-orange-400 font-bold text-lg h-8 animate-in slide-in-from-bottom-2 duration-300">
            {interimTranscript || 'Try saying "Cook jobs in Mumbai"'}
          </p>
          <button
            title="Cancel voice input"
            onClick={() => setIsListening(false)}
            className="mt-16 w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all border border-white/20"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {isLocationPickerOpen && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900">
                Search Filter
              </h2>
              <button
                title="Close filter settings"
                onClick={() => setIsLocationPickerOpen(false)}
                className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="mb-8">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">
                Search Distance
              </p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {DISTANCE_OPTIONS.map((d) => (
                  <button
                    key={d}
                    title={`Filter by jobs within ${d}km`}
                    onClick={() => setMaxDistance(d)}
                    className={`shrink-0 px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                      maxDistance === d
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 active:bg-slate-50"
                    }`}
                  >
                    {d} KM
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">
                Popular Areas
              </p>
              <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-60 no-scrollbar pr-1">
                {Object.keys(STATES_AND_CITIES).map((state) =>
                  STATES_AND_CITIES[state].slice(0, 2).map((city) => (
                    <button
                      key={city}
                      title={`Set location to ${city}`}
                      onClick={() => handleManualLocationSelect(city)}
                      className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-left active:bg-indigo-50 transition-colors group"
                    >
                      <p className="text-xs font-black text-slate-800 group-active:text-indigo-600">
                        {city}
                      </p>
                      <p className="text-[8px] font-bold text-slate-300 uppercase mt-0.5">
                        {state}
                      </p>
                    </button>
                  )),
                )}
              </div>
            </div>

            <button
              title="Detect my current location using GPS"
              onClick={() => {
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      const loc = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        address: "Current Area",
                        source: "GPS" as const,
                      };
                      setUserLocation(loc);
                      setIsLocationPickerOpen(false);
                    },
                    null,
                    { enableHighAccuracy: true },
                  );
                }
              }}
              className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all"
            >
              <i className="fa-solid fa-location-crosshairs mr-2"></i> Use My
              GPS Location
            </button>
          </div>
        </div>
      )}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default WorkerView;
