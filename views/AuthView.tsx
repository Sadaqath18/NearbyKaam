import React, { useState, useEffect, useRef } from "react";
import { UserRole } from "../types";
import { ADMIN_WHITELIST } from "../constants";
import { speakText } from "../services/geminiService";
import STRINGS from "../i18n/strings";
import AUTH_STRINGS from "../i18n/auth";
import VoiceInstruction from "../components/VoiceInstructions";
import { useLanguage } from "../context/LanguageContext";

interface AuthViewProps {
  onLogin: (role: UserRole, phone: string) => void;
  onAdminLogin: (phone: string) => void;
  onGuestAccess: () => void;

  onChangeLanguage: () => void;
}

type SpeakingRole = "WORK" | "HIRE" | null;

const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onAdminLogin,
  onGuestAccess,
  onChangeLanguage,
}) => {
  const [step, setStep] = useState<
    "ROLE" | "PHONE" | "OTP" | "ADMIN_PHONE" | "ADMIN_OTP"
  >("ROLE");

  const { language } = useLanguage();
  const lang = language ?? "en";
  const t = STRINGS[lang];
  const a = AUTH_STRINGS[lang];

  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.WORKER);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [speakingRole, setSpeakingRole] = useState<SpeakingRole>(null);

  const recognitionRef = useRef<any>(null);

  /* ---------------- TTS (SPEAK ROLE) ---------------- */

  const speakRole = (text: string, role: SpeakingRole) => {
    if (!("speechSynthesis" in window) || !language) return;

    window.speechSynthesis.cancel();
    setSpeakingRole(role);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = `${language}-IN`;

    utterance.onend = () => setSpeakingRole(null);
    utterance.onerror = () => setSpeakingRole(null);

    window.speechSynthesis.speak(utterance);
  };

  const speakOnce = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // stop previous speech
      speakText(text, language);
    }
  };

  /* ---------------- VOICE COMMAND ---------------- */
  const startVoiceCommand = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition not supported on this device");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang =
      {
        en: "en-IN",
        hi: "hi-IN",
        kn: "kn-IN",
        ta: "ta-IN",
        te: "te-IN",
        mr: "mr-IN",
        ur: "ur-IN",
        ml: "ml-IN",
        gu: "gu-IN",
        bn: "bn-IN",
        pa: "pa-IN",
        or: "or-IN",
        as: "as-IN",
        ne: "ne-NP",
        sd: "sd-IN",
        ks: "ur-IN",
      }[language] || "en-IN";

    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const spoken = event.results[0][0].transcript.toLowerCase();

      if (spoken.includes("work")) {
        setSelectedRole(UserRole.WORKER);
        setStep("PHONE");
        speakRole(t.work, "WORK");
      }

      if (spoken.includes("hire")) {
        setSelectedRole(UserRole.EMPLOYER);
        setStep("PHONE");
        speakRole(t.hire, "HIRE");
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  /* ---------------- ENTER KEY ---------------- */
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (step === "PHONE" || step === "ADMIN_PHONE") handlePhoneSubmit();
        if (step === "OTP" || step === "ADMIN_OTP") handleVerify();
      }
    };
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [step, phone, otp]);

  /* ---------------- PHONE ---------------- */
  const handlePhoneSubmit = () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Invalid Number");
      return;
    }
    setError("");
    if (step === "ADMIN_PHONE") {
      if (!ADMIN_WHITELIST.includes(phone)) {
        setError("Unauthorized");
        return;
      }
      setStep("ADMIN_OTP");
    } else {
      setStep("OTP");
    }
    setOtp(["", "", "", "", "", ""]);
    setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
  };

  /* ---------------- VERIFY OTP ---------------- */
  const handleVerify = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) return;

    setIsVerifying(true);

    setTimeout(() => {
      if (step === "ADMIN_OTP") {
        enteredOtp === "999999" ? onAdminLogin(phone) : setError("Wrong OTP");
      } else {
        enteredOtp === "123456"
          ? onLogin(selectedRole, phone)
          : setError("Wrong OTP, try again");
      }
      setIsVerifying(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-white relative">
      {step === "ROLE" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChangeLanguage();
          }}
          className="absolute top-6 right-6 z-50 px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-full flex items-center gap-2 text-slate-700 shadow-sm hover:border-orange-500 hover:bg-orange-50 active:scale-95 transition-all"
        >
          <i className="fa-solid fa-globe text-xs text-orange-500"></i>
          <span className="text-xs font-black uppercase tracking-widest">
            {language}
          </span>
        </button>
      )}

      {/* 🎤 Voice Command Button */}
      {step === "ROLE" && (
        <button
          title="Click to speak your choice"
          type="button"
          onClick={startVoiceCommand}
          className="absolute top-6 left-6 z-50 w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg"
        >
          <i className="fa-solid fa-microphone"></i>
        </button>
      )}

      <div className="flex-1 px-5 pt-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-orange-500 rounded-[30px] flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-xl border-b-4 border-orange-700">
            <i className="fa-solid fa-briefcase"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 leading-none">
            NearbyKaam
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2 px-6">
            {t.tagline}
          </p>
        </div>

        {step === "ROLE" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
              onClick={() => {
                setSelectedRole(UserRole.WORKER);
                setStep("PHONE");
              }}
              className="relative group p-6 bg-white border-2 cursor-pointer flex items-center gap-4 border-slate-200 p-6 rounded-[32px] hover:border-orange-500 hover:bg-orange-50"
            >
              {/* 🔊 Speaker */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakRole(t.work, "WORK");
                }}
                className={`absolute top-4 right-4 w-9 h-9 rounded-full

${
  speakingRole === "WORK"
    ? "bg-orange-500 text-white animate-pulse ring-4 ring-orange-300"
    : "bg-orange-50 text-orange-500 hover:bg-orange-100"
}`}
                aria-label="Speak I want work"
              >
                <i className="fa-solid fa-volume-high text-sm"></i>
              </button>

              <div className="w-14 h-14 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center text-orange-500 text-xl">
                <i className="fa-solid fa-person-digging"></i>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {t.work}
                </h3>
                <p className="text-slate-500 text-xs font-bold mt-1">
                  {t.workSub}
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                setSelectedRole(UserRole.EMPLOYER);
                setStep("PHONE");
              }}
              className="relative group p-6 bg-white border-2 cursor-pointer flex items-center gap-4 border-slate-200 p-6 rounded-[32px] hover:border-blue-500 hover:bg-blue-50"
            >
              {/* 🔊 Speaker */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakRole(t.hire, "HIRE");
                }}
                className={`absolute top-4 right-4 w-9 h-9 rounded-full
flex items-center justify-center transition
group-hover:opacity-100
${
  speakingRole === "HIRE"
    ? "bg-blue-500 text-white animate-pulse ring-4 ring-blue-300"
    : "bg-blue-50 text-blue-500 hover:bg-blue-100"
}`}
                aria-label="Speak I want to hire"
              >
                <i className="fa-solid fa-volume-high text-sm"></i>
              </button>

              <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center text-blue-500 text-xl">
                <i className="fa-solid fa-user-tie"></i>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {t.hire}
                </h3>
                <p className="text-slate-500 text-xs font-bold mt-1">
                  {t.hireSub}
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep("ADMIN_PHONE")}
              className="w-full py-4 text-slate-400 font-black text-[9px] uppercase tracking-widest text-center mt-4 hover:text-slate-600 transition-colors"
            >
              {t.admin}
            </button>
          </div>
        )}

        {(step === "PHONE" || step === "ADMIN_PHONE") && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <button
              onClick={() => setStep("ROLE")}
              className="text-slate-500 text-[10px] font-black uppercase mb-8 flex items-center gap-2 tracking-widest active:scale-95 hover:text-indigo-600 transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i> BACK
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              {t.mobile}
            </h2>
            <div className="flex gap-2">
              <div className="bg-slate-100 border-2 border-slate-300 px-4 py-4 rounded-2xl font-black text-slate-500 flex items-center shadow-sm">
                +91
              </div>
              <input
                type="tel"
                className="flex-1 bg-white border-2 border-slate-300 rounded-2xl px-4 py-4 font-black text-lg outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
                placeholder="00000 00000"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            {error && (
              <p className="text-red-500 text-[10px] font-bold mt-2 uppercase">
                {error}
              </p>
            )}
            <button
              onClick={handlePhoneSubmit}
              className="py-5 text-sm w-full bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl mt-10 active:scale-95 transition-all border-b-4 border-slate-700 hover:bg-slate-800"
            >
              {t.otp}
            </button>
            {selectedRole === UserRole.WORKER && step === "PHONE" && (
              <button
                onClick={onGuestAccess}
                className="w-full mt-4 py-4 text-orange-600 font-black text-[10px] uppercase bg-white rounded-2xl border-2 border-orange-200 active:bg-orange-50 hover:bg-orange-50 transition-colors"
              >
                {t.guest}
              </button>
            )}
          </div>
        )}

        {(step === "OTP" || step === "ADMIN_OTP") && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <VoiceInstruction title={a.tapToHear} text={a.otpInstruction} />

            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Verify OTP
            </h2>

            <div className="flex items-center justify-between mb-8">
              <p className="text-slate-500 text-[10px] font-bold uppercase">
                Sent to +91 {phone}
              </p>

              <button
                type="button"
                title="Change phone number"
                onClick={() => {
                  setOtp(Array(6).fill(""));
                  setStep(step === "ADMIN_OTP" ? "ADMIN_PHONE" : "PHONE");
                }}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
              >
                ← Change Ph No.
              </button>
            </div>

            <div className="flex justify-between gap-2 mb-10">
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  aria-label={`OTP digit ${i + 1}`}
                  title={`OTP digit ${i + 1}`}
                  className="w-11 h-14 bg-white border-2 border-slate-400 rounded-xl text-center text-xl font-black focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none shadow-md transition-all"
                  value={d}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ""); // remove non-numbers
                    if (!val) return;

                    const next = [...otp];
                    next[i] = e.target.value.slice(-1);
                    setOtp(next);
                    if (e.target.value && i < otp.length - 1) {
                      document.getElementById(`otp-${i + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      const next = [...otp];
                      if (otp[i]) {
                        next[i] = "";
                        setOtp(next);
                      } else if (i > 0) {
                        next[i - 1] = "";
                        setOtp(next);
                        document.getElementById(`otp-${i - 1}`)?.focus();
                      }
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const paste = e.clipboardData
                      .getData("text")
                      .replace(/\D/g, "")
                      .slice(0, otp.length);

                    if (!paste) return;

                    const next = [...otp];
                    paste.split("").forEach((char, idx) => {
                      next[idx] = char;
                    });
                    setOtp(next);

                    const lastIndex = paste.length - 1;
                    document.getElementById(`otp-${lastIndex}`)?.focus();
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="py-5 text-sm w-full bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all border-b-4 border-slate-700 hover:bg-slate-800"
            >
              {isVerifying ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                "CONTINUE"
              )}
            </button>
            <p className="text-center mt-8 text-[9px] font-black text-slate-300 uppercase">
              Demo OTP: 123456
            </p>
          </div>
        )}
      </div>

      <div className="p-8 text-center bg-slate-50 border-t border-slate-100 mt-auto">
        <p className="text-[10px] text-slate-400 font-bold tracking-tight">
          {t.footer}
        </p>
      </div>
    </div>
  );
};

export default AuthView;
