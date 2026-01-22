import React, { useState, useEffect } from "react";
import { UserRole } from "../types";
import { ADMIN_WHITELIST } from "../constants";

interface AuthViewProps {
  onLogin: (role: UserRole, phone: string) => void;
  onAdminLogin: (phone: string) => void;
  onGuestAccess: () => void;
  language: string;
  onChangeLanguage: () => void;
}

const STRINGS: Record<string, any> = {
  en: {
    tagline: "Nearby ka kaam, turant call",
    work: "I want Work",
    workSub: "Find jobs near you",
    hire: "I want to Hire",
    hireSub: "Post a job for locals",
    admin: "System Admin Login (OTP Only)",
    footer: "Secure identity powered by NearbyKaam.",
    mobile: "Enter Mobile",
    guest: "Browse Jobs First",
    otp: "Get OTP",
  },
  hi: {
    tagline: "पास का काम, तुरंत कॉल",
    work: "मुझे काम चाहिए",
    workSub: "आपके पास की नौकरियाँ",
    hire: "मुझे कर्मचारी चाहिए",
    hireSub: "స్థानीय لوگوں के लिए नौकरी डालें",
    admin: "सिस्टम एडमिन लॉगिन (केवल OTP)",
    footer: "NearbyKaam द्वारा सुरक्षित पहचान।",
    mobile: "मोबाइल नंबर दर्ज करें",
    guest: "पहले काम देखें",
    otp: "ओটিপি प्राप्त करें",
  },
  kn: {
    tagline: "ಹತ್ತಿರದ ಕೆಲಸ, ತಕ್ಷಣ ಕರೆ",
    work: "ನನಗೆ ಕೆಲಸ ಬೇಕು",
    workSub: "ನಿಮ್ಮ ಹತ್ತಿರದ ಕೆಲಸಗಳು",
    hire: "ನನಗೆ ಕೆಲಸಗಾರರು ಬೇಕು",
    hireSub: "ಸ್ಥಳೀಯರಿಗಾಗಿ ಕೆಲಸ ಹಾಕಿ",
    admin: "ಸಿಸ್ಟಮ್ ಆಡ್ಮಿನ್ ಲಾಗಿನ್ (OTP ಮಾತ್ರ)",
    footer: "NearbyKaam ಮೂಲಕ ಸುರಕ್ಷಿತ ಗುರುತು.",
    mobile: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    guest: "ಮೊದಲು ಕೆಲಸಗಳನ್ನು ನೋಡಿ",
    otp: "OTP ಪಡೆಯಿರಿ",
  },
  ta: {
    tagline: "அருகிலுள்ள வேலை, உடனடி அழைப்பு",
    work: "எனக்கு வேலை வேண்டும்",
    workSub: "உங்களுக்கு அருகிலுள்ள வேலைகள்",
    hire: "எனக்கு ஊழியர் வேண்டும்",
    hireSub: "உள்ளூர்வாசிகளுக்கான வேலை இடுங்கள்",
    admin: "நிர்வாக உள்நுழைவு (OTP மட்டும்)",
    footer: "NearbyKaam மூலம் பாதுகாப்பான அடையாளம்.",
    mobile: "மொபைல் எண்",
    guest: "வேலைகளைப் பாருங்கள்",
    otp: "OTP பெறவும்",
  },
  te: {
    tagline: "దగ్గర పని, వెంటనే కాల్",
    work: "నాకు పని కావాలి",
    workSub: "మీకు దగ్గరలో ఉన్న పనులు",
    hire: "నాకు ఉద్యోగులు కావాలి",
    hireSub: "స్థానికుల కోసం ఉద్యోగం పోస్ట్ చేయండి",
    admin: "సిస్టమ్ అడ్మిన్ లాగిన్ (OTP మాత్రమే)",
    footer: "NearbyKaam ద్వారా సురక్షిత గుర్తింపు.",
    mobile: "మొబైల్ సంఖ్య",
    guest: "ముందుగా పనులను చూడండి",
    otp: "OTP పొందండి",
  },
  mr: {
    tagline: "जवळचं काम, लगेच कॉल",
    work: "मला काम हवे",
    workSub: "तुमच्या जवळील नोकऱ्या",
    hire: "मला कर्मचारी हवेत",
    hireSub: "स्थानिकांसाठी नोकरी टाका",
    admin: "सिस्टम अ‍ॅडमिन लॉगिन (फक्त OTP)",
    footer: "NearbyKaam द्वारे सुरक्षित ओळख.",
    mobile: "மொபைல் நம்பர்",
    guest: "आधी नोकऱ्या पहा",
    otp: "OTP मिळवा",
  },
  gu: {
    tagline: "નજીકનું કામ, તરત કોલ",
    work: "મને કામ જોઈએ",
    workSub: "તમારી નજીકની નોકરીઓ",
    hire: "મને कर्मचारी જોઈએ",
    hireSub: "સ્થાનિક લોકો માટે નોકરી મૂકો",
    admin: "સિસ્ટમ એડમિન લોગિન (માત્ર OTP)",
    footer: "NearbyKaam દ્વારા સૂરક્ષિત ઓળખ.",
    mobile: "મોબાઈલ નંબર",
    guest: "પહેલા નોકરીઓ જુઓ",
    otp: "OTP મેળવો",
  },
  bn: {
    tagline: "কাছাকাছি কাজ, সঙ্গে সঙ্গে কল",
    work: "আমার কাজ চাই",
    workSub: "আপনার কাছাকাছি কাজ",
    hire: "আমার কর্মী দরকার",
    hireSub: "স্থানীয়দের জন্য কাজ দিন",
    admin: "সিস্টেম অ্যাডমিন লগইন (শুধু OTP)",
    footer: "NearbyKaam দ্বারা সুরক্ষিত পরিচয়।",
    mobile: "মোবাইল নম্বর",
    guest: "আগে কাজ দেখুন",
    otp: "OTP পান",
  },
  pa: {
    tagline: "ਨੇੜੇ ਦਾ ਕੰਮ, ਤੁਰੰਤ ਕਾਲ",
    work: "ਮੈਨੂੰ ਕੰਮ ਚਾਹੀਦਾ",
    workSub: "ਤੁਹਾਡੇ ਨੇੜੇ ਨੌਕਰੀਆਂ",
    hire: "ਮੈਨੂੰ ਕਰਮਚਾਰੀ ਚਾਹੀਦੇ",
    hireSub: "ਸਥਾਨਕ ਲੋਕਾਂ ਲਈ ਨੌਕਰੀ ਪਾਓ",
    admin: "ਸਿਸਟਮ ਐਡਮਿਨ ਲਾਗਿਨ (ਸਿਰਫ OTP)",
    footer: "NearbyKaam ਦੁਆਰਾ ਸਿਰਫ ਸੁਰੱਖਿਅত ਪਛਾਣ।",
    mobile: "ਮੋਬਾਈਲ ਨੰਬਰ",
    guest: "ਪਹਿਲਾਂ নੌਕਰੀਆਂ ਦੇਖੋ",
    otp: "OTP ਪ੍ਰਾਪਤ ਕਰੋ",
  },
  ml: {
    tagline: "സമീപത്തെ ജോലി, ഉടൻ വിളി",
    work: "എനിക്ക് ജോലി വേണം",
    workSub: "സമീപത്തെ ജോലികൾ",
    hire: "എനിക്ക് തൊഴിലാളികൾ വേണം",
    hireSub: "പ്രാദേശികക്കാർക്കായി ജോലി നൽകുക",
    admin: "സിസ്റ്റം അഡ്മിൻ ലോഗിൻ (OTP മാത്രം)",
    footer: "NearbyKaam വഴി സുരക്ഷിത തിരിച്ചറിയൽ.",
    mobile: "മൊബൈൽ നമ്പർ",
    guest: "ആദ്യം ജോലികൾ കാണുക",
    otp: "OTP ലഭിക്കുക",
  },
  or: {
    tagline: "ନିକଟର କାମ, ସତ୍ୱର କଲ୍",
    work: "ମୋତે କାମ ଦେରକାର",
    workSub: "ନିକଟର କାମ",
    hire: "ମୋତે କର୍ମଚାରୀ ଦରକାର",
    hireSub: "ସ୍ଥାନୀୟ ଲୋକଙ୍କ ପାଇଁ କାମ ଦିଅନ୍ତୁ",
    admin: "ସିଷ୍ଟម ଏଡମିନ ଲଗଇନ (OTP ମାତ୍ର)",
    footer: "NearbyKaam ଦ୍ଵାରା ସୁରକ୍ଷିତ ପରିଚୟ।",
    mobile: "ମୋବାଇଲ୍ ନମ୍ବର",
    guest: "ପୂର୍ବରୁ କାମ ଦେଖନ୍ତು",
    otp: "OTP ପାଆନ୍ତು",
  },
  as: {
    tagline: "ওচৰৰ কাম, তৎক্ষণাৎ কল",
    work: "মোক কাম লাগে",
    workSub: "ওচৰৰ কাম",
    hire: "মোক কৰ্মচাৰী লাগে",
    hireSub: "স্থানীয়ৰ বাবে কাম দিয়ক",
    admin: "ছিষ্টেম এডমিন লগইন (OTP মাথোঁ)",
    footer: "NearbyKaam ৰ দ্বাৰা সুৰক্ষিত পৰিচয়।",
    mobile: "ম'বাইল নম্বৰ",
    guest: "প্ৰথমে কাম চাওক",
    otp: "OTP পাওক",
  },
  ur: {
    tagline: "قریب کا کام، فوراً کال",
    work: "مجھے کام چاہیے",
    workSub: "آپ کے قریب نوکریاں",
    hire: "مجھے ملازم چاہیے",
    hireSub: "مقامی لوگوں کے لیے نوکری پوسٹ کریں",
    admin: "سسٹم ایڈمن لاگ ان (صرف OTP)",
    footer: "NearbyKaam کے ذریعے محفوظ شناخت।",
    mobile: "موبائل نمبر",
    guest: "نورکیاں دیکھیں",
    otp: "او ٹی پی حاصل کریں",
  },
  ks: {
    tagline: "نزدیک کام, فوری کال",
    work: "مےٚ کٲم چھُ ضرورت",
    workSub: "نزدیک روزگار",
    hire: "مےٚ روزگار دینہٕ",
    hireSub: "مقامی لوکن خٲطرٕ روزگار",
    admin: "سسٹم ایڈمن لاگ ان (صرف OTP)",
    footer: "NearbyKaam ذٔریعہٕ مَحفوٗظ شناخت।",
    mobile: "موبائل نمبر",
    guest: "کٲم वچھو",
    otp: "او ٹی پی منگوٲو",
  },
  sd: {
    tagline: "ويجهو ڪم، فوري ڪال",
    work: "مون کي ڪم کپي",
    workSub: "ويجهي نوڪريون",
    hire: "مون کي ملازم کپي",
    hireSub: "مقامي ماڻهن لاءِ نوڪري رکو",
    admin: "سسٽم ايڊمن لاگ ان (صर्फ OTP)",
    footer: "NearbyKaam ذريعي محفوظ سڃاڃپ।",
    mobile: "موبائل نمبر",
    guest: "پهرين نوڪريون ڏسو",
    otp: "او ٽي پي حاصل ڪريو",
  },
  ne: {
    tagline: "नजिकको काम, तुरुन्त कल",
    work: "मलाई काम चाहिन्छ",
    workSub: "नजिकका कामहरू",
    hire: "मलाई कर्मचारी चाहिन्छ",
    hireSub: "स्थानीय मानिसहरूका लागि काम राख्नुहोस्",
    admin: "सिस्टम एडमिन लगइन (OTP मात्र)",
    footer: "NearbyKaam द्वारा सुरक्षित पहिचान।",
    mobile: "मोबाइल नम्बर",
    guest: "पहिले काम हेर्नुहोस्",
    otp: "OTP पाउनुहोस्",
  },
};

const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onAdminLogin,
  onGuestAccess,
  language,
  onChangeLanguage,
}) => {
  const [step, setStep] = useState<
    "ROLE" | "PHONE" | "OTP" | "ADMIN_PHONE" | "ADMIN_OTP"
  >("ROLE");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.WORKER);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

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

  const t = STRINGS[language] || STRINGS["en"];

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

  const handleVerify = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) return;
    setIsVerifying(true);
    setTimeout(() => {
      if (step === "ADMIN_OTP") {
        if (enteredOtp === "999999") onAdminLogin(phone);
        else {
          setError("Wrong OTP");
          setIsVerifying(false);
        }
      } else {
        if (enteredOtp === "123456") onLogin(selectedRole, phone);
        else {
          setError("Wrong OTP");
          setIsVerifying(false);
        }
      }
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
            <button
              onClick={() => {
                setSelectedRole(UserRole.WORKER);
                setStep("PHONE");
              }}
              className="w-full bg-white border-2 border-slate-200 p-6 rounded-[32px] text-left transition-all flex items-center gap-4 shadow-sm hover:border-orange-500 hover:bg-orange-50 active:scale-[0.98]"
            >
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
            </button>
            <button
              onClick={() => {
                setSelectedRole(UserRole.EMPLOYER);
                setStep("PHONE");
              }}
              className="w-full bg-white border-2 border-slate-200 p-6 rounded-[32px] text-left transition-all flex items-center gap-4 shadow-sm hover:border-blue-500 hover:bg-blue-50 active:scale-[0.98]"
            >
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
            </button>
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
