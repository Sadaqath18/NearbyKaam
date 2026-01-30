import React, { useState, useRef, useEffect } from "react";
import { WorkerProfile, JobCategory, Location, WorkerResume } from "../types";
import { CATEGORIES } from "../constants";

interface WorkerProfileDrawerProps {
  isOpen: boolean;

  onClose?: () => void;
  onExitRequest?: () => void;

  profile: WorkerProfile;
  onSave: (p: WorkerProfile) => void;

  onChangeLanguage: () => void;

  isMandatory?: boolean; // Field-level (validation, asterisks, errors)
  forceComplete?: boolean; //  Flow-level (cannot close / cannot skip)
}

const getEmptyWorkerProfile = (phone: string): WorkerProfile => ({
  phone,
  name: "",
  email: "",
  preferredJobTitle: "",
  jobType: undefined as unknown as JobCategory,
  expectedSalary: undefined,
  expectedSalaryType: undefined,
  location: undefined,
  createdAt: new Date().toISOString(), // ✅ REQUIRED FIELD
  resume: {
    hasAudio: false,
    hasDocument: false,
    audioUrl: null,
    documentUrl: null,
    documentName: null,
  },
});

const WorkerProfileDrawer: React.FC<WorkerProfileDrawerProps> = ({
  isOpen,
  profile,
  onSave,

  onClose,
  onExitRequest,
  onChangeLanguage,

  isMandatory = false,
  forceComplete = false,
}) => {
  const [localProfile, setLocalProfile] = useState<WorkerProfile>(() =>
    getEmptyWorkerProfile(profile.phone),
  );

  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(
    profile.resume?.audioUrl || null,
  );
  const [errors, setErrors] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Always reset when phone changes (NEW LOGIN)
    setLocalProfile(getEmptyWorkerProfile(profile.phone));
    setAudioPreviewUrl(null);
    setErrors([]);
    setStep(1);

    // If profile already belongs to THIS phone and is completed → edit mode
    if (profile.phone && profile.name && profile.preferredJobTitle) {
      setLocalProfile(profile);
      setAudioPreviewUrl(profile.resume?.audioUrl || null);
    }
  }, [profile.phone, isOpen]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const totalSteps = 3;
  const progressPercent = Math.round((step / totalSteps) * 100);

  // Logical check: if a name is present, the profile was already 'completed' at least once.
  const isPreviouslyCompleted = !!(profile.name && profile.preferredJobTitle);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioPreviewUrl(url);
        setLocalProfile((prev) => ({
          ...prev,
          resume: {
            ...prev.resume,
            audioUrl: url,
            hasAudio: true,
          },
        }));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 89) {
            stopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Mic access denied", err);
      setErrors(["Microphone access is required for audio resume."]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(["File size must be under 2MB"]);
        return;
      }

      const url = URL.createObjectURL(file);
      setLocalProfile((prev) => ({
        ...prev,
        resume: {
          ...prev.resume,
          documentUrl: url,
          documentName: file.name,
          hasDocument: true,
        },
      }));
      setErrors([]);
    }
  };

  const removeDocument = () => {
    setLocalProfile((prev) => ({
      ...prev,
      resume: {
        ...prev.resume,
        documentUrl: null,
        documentName: null,
        hasDocument: false,
      },
    }));
  };

  const removeAudio = () => {
    setAudioPreviewUrl(null);
    setLocalProfile((prev) => ({
      ...prev,
      resume: { ...prev.resume, audioUrl: null, hasAudio: false },
    }));
  };

  const validateStep = () => {
    const currentErrors: string[] = [];
    if (step === 1) {
      if (!localProfile.name.trim())
        currentErrors.push("Full Name is required");
      if (!localProfile.preferredJobTitle.trim())
        currentErrors.push("Preferred Job Title is required");
      if (!localProfile.jobType)
        currentErrors.push("Please select an Industry");
    } else if (step === 2) {
      if (!localProfile.expectedSalary)
        currentErrors.push("Monthly Salary is required");
    }
    setErrors(currentErrors);
    return currentErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps) setStep(step + 1);
      else handleSave();
    }
  };

  const handleSave = () => {
    if (validateStep()) {
      onSave(localProfile);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
      <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        {!isMandatory && (
          <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8 sm:hidden"></div>
        )}

        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {isPreviouslyCompleted ? "Update Profile" : "Worker Profile"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-black text-orange-500 uppercase">
                {step} of {totalSteps}
              </span>
            </div>
          </div>

          {/* HEADER ACTION */}
          {forceComplete
            ? onExitRequest && (
                <button
                  title="Exit to guest mode"
                  onClick={onExitRequest}
                  className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 active:scale-90 transition-all"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )
            : onClose && (
                <button
                  title="Close profile"
                  onClick={onClose}
                  className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 active:scale-90 transition-all"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-6">
            {errors.map((err, i) => (
              <p
                key={i}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2"
              >
                <i className="fa-solid fa-circle-exclamation text-[8px]"></i>{" "}
                {err}
              </p>
            ))}
          </div>
        )}

        <div className="mt-8">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                  Full Name*
                </label>
                <input
                  type="text"
                  title="Your full name as per ID"
                  className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. Rahul Sharma"
                  value={localProfile.name}
                  onChange={(e) =>
                    setLocalProfile({ ...localProfile, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    readOnly
                    className="w-full bg-gray-100 border-0 rounded-2xl p-4 font-bold text-gray-400 cursor-not-allowed"
                    value={localProfile.phone}
                    title="Phone number is automatically verified and cannot be changed here."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    title="Optional email for job alerts"
                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-orange-500"
                    placeholder="mail@example.com"
                    value={localProfile.email || ""}
                    onChange={(e) =>
                      setLocalProfile({
                        ...localProfile,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                  Select Industry*
                </label>
                <div className="relative">
                  <select
                    title="Choose your primary work industry"
                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold text-gray-800 appearance-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    value={localProfile.jobType}
                    onChange={(e) =>
                      setLocalProfile({
                        ...localProfile,
                        jobType: e.target.value as JobCategory,
                      })
                    }
                  >
                    <option value="" disabled>
                      Choose your work industry
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                  Preferred Job Title*
                </label>
                <input
                  type="text"
                  title="The specific role you are looking for"
                  className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. Delivery & Logistics Executive, Personal Cook, Guard"
                  value={localProfile.preferredJobTitle}
                  onChange={(e) =>
                    setLocalProfile({
                      ...localProfile,
                      preferredJobTitle: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Expected Salary Input */}
              <input
                type="text"
                inputMode="numeric"
                placeholder="₹ Expected salary"
                aria-label="Expected salary"
                title="Expected salary"
                value={localProfile.expectedSalary ?? ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setLocalProfile({
                    ...localProfile,
                    expectedSalary: val ? Number(val) : undefined,
                  });
                }}
                className="w-full border rounded-xl p-3 text-sm font-bold"
              />

              {/* Salary Type Toggle */}
              <div className="flex gap-2">
                {(["DAILY", "MONTHLY"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocalProfile({
                        ...localProfile,
                        expectedSalaryType: type,
                      });
                    }}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${
                      localProfile.expectedSalaryType === type
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <p className="text-xs font-black text-gray-900 mb-2 uppercase tracking-widest">
                  Resume Center
                </p>
                <p className="text-[10px] font-bold text-gray-400 mb-8 uppercase tracking-widest leading-relaxed">
                  Recommended to get 3x more calls
                </p>

                <div
                  className={`p-6 rounded-[32px] border-2 transition-all ${
                    isRecording
                      ? "bg-red-50 border-red-200"
                      : localProfile.resume.hasAudio
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-orange-50 border-orange-100"
                  }`}
                >
                  <button
                    title={
                      isRecording
                        ? "Stop recording now"
                        : "Start recording your voice resume"
                    }
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl mx-auto shadow-xl transition-all active:scale-90 ${
                      isRecording
                        ? "bg-red-500 animate-pulse"
                        : localProfile.resume.hasAudio
                          ? "bg-emerald-500"
                          : "bg-orange-500"
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        isRecording ? "fa-stop" : "fa-microphone"
                      }`}
                    ></i>
                  </button>

                  <div className="mt-4">
                    {isRecording ? (
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-red-500">
                          {90 - recordingSeconds}s
                        </span>
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                          Recording...
                        </span>
                      </div>
                    ) : localProfile.resume.hasAudio ? (
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                          Audio Resume Saved ✅
                        </span>
                        <div className="mt-4 flex items-center gap-2 w-full">
                          <audio
                            src={audioPreviewUrl!}
                            controls
                            className="h-8 flex-1"
                          />
                          <button
                            title="Delete audio resume"
                            onClick={removeAudio}
                            className="w-8 h-8 bg-white text-red-400 rounded-lg shadow-sm flex items-center justify-center border border-red-50"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <h3 className="text-xs font-black uppercase text-gray-800">
                          Record Audio Resume
                        </h3>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-wider leading-relaxed">
                          "I am Rajesh, I have 5 years experience in driving
                          heavy vehicles..."
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative flex py-8 items-center">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    OR
                  </span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                {localProfile.resume.hasDocument ? (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <i className="fa-solid fa-file-pdf text-xl"></i>
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[10px] font-black text-slate-900 truncate uppercase">
                          {localProfile.resume.documentName}
                        </p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">
                          Document Uploaded
                        </p>
                      </div>
                    </div>
                    <button
                      title="Remove document"
                      onClick={removeDocument}
                      className="text-red-400 p-2"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                ) : (
                  <button
                    aria-label="Upload Resume Document"
                    title="Select a file from your device"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-5 bg-white border-2 border-slate-100 border-dashed rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 active:bg-slate-50 transition-all"
                  >
                    <i className="fa-solid fa-file-arrow-up text-lg"></i>
                    Upload Resume (PDF / DOC)
                  </button>
                )}
                <input
                  aria-label="Upload Resume Document"
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 flex gap-3">
          {step > 1 && (
            <button
              title="Go to previous step"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px] active:scale-95 transition-all"
            >
              Back
            </button>
          )}
          <button
            title={
              step === totalSteps
                ? isPreviouslyCompleted
                  ? "Save your updated profile"
                  : "Finish setting up your profile"
                : "Go to next step"
            }
            onClick={handleNext}
            className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-orange-100 active:scale-95 transition-all"
          >
            {step === totalSteps
              ? isPreviouslyCompleted
                ? "Update Profile"
                : "Complete Profile"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfileDrawer;
