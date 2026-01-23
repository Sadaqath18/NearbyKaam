import React, { useState, useEffect } from "react";
import { LANGUAGES } from "../constants";
import { speakText } from "../services/geminiService";

interface LanguageSelectionViewProps {
  onSelect: (code: string) => void;
  onBack?: () => void;
}

const TOP_LANG_CODES = ["hi", "kn", "en", "mr", "te", "ta", "ur", "ml"];
const TTS_FALLBACK: Record<string, { text: string; lang: string }> = {
  pa: { text: "Punjabi", lang: "hi" },
  or: { text: "Odia", lang: "hi" },
  as: { text: "Assamese", lang: "hi" },
  ks: { text: "Kashmiri", lang: "hi" },
  sd: { text: "Sindhi", lang: "hi" },
};

const LanguageSelectionView: React.FC<LanguageSelectionViewProps> = ({
  onSelect,
  onBack,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);

  const topLanguages = LANGUAGES.filter((l) =>
    TOP_LANG_CODES.includes(l.code),
  ).sort(
    (a, b) => TOP_LANG_CODES.indexOf(a.code) - TOP_LANG_CODES.indexOf(b.code),
  );

  const otherLanguages = LANGUAGES.filter(
    (l) => !TOP_LANG_CODES.includes(l.code),
  );

  const speakLanguage = (lang: {
    nativeName: string;
    name: string;
    code: string;
  }) => {
    const fallback = TTS_FALLBACK[lang.code];

    if (fallback) {
      speakText(fallback.text, fallback.lang);
    } else {
      speakText(lang.nativeName, lang.code);
    }
  };
  

  const handleFirstInteraction = () => {
    if (!sessionStorage.getItem("LANGUAGE_GREETING_PLAYED")) {
      speakText(
        "Namaste! Please select your language to continue. कृपया अपनी भाषा चुनें।",
        "hi",
      );
      sessionStorage.setItem("LANGUAGE_GREETING_PLAYED", "true");
    }
  };

  const handleLanguageClick = (code: string) => {
    // Only show confirmation if mid-app (indicated by presence of onBack)
    if (onBack) {
      setPendingLanguage(code);
    } else {
      onSelect(code);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-slate-50 overflow-hidden relative"
      onClick={handleFirstInteraction}
      onTouchStart={handleFirstInteraction}
    >
      {/* Back/Exit Button */}
      {onBack && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="absolute top-6 left-6 z-50 w-11 h-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500 shadow-sm active:scale-90 transition-all"
          aria-label="Back"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
      )}

      <div className="text-center pt-16 pb-6 px-6 shrink-0 bg-slate-50 z-10">
        <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-xl">
          <i className="fa-solid fa-language"></i>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          NearbyKaam
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Select Language • भाषा चुनें
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-20 no-scrollbar relative">
        {/* Single Grid Container for All Language Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* TOP LANGUAGES */}
          {topLanguages.map((lang) => (
            <div
              key={lang.code}
              className="relative bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:border-orange-500 hover:shadow-md transition-all group"
            >
              {/* 🔊 Speaker */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakLanguage(lang);
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition"
                aria-label={`Speak ${lang.name}`}
              >
                <i className="fa-solid fa-volume-high text-xs"></i>
              </button>

              {/* Language Select */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLanguageClick(lang.code);
                }}
                className="flex flex-col items-center justify-center"
              >
                <span className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600">
                  {lang.nativeName}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-orange-400">
                  {lang.name}
                </span>
              </button>
            </div>
          ))}

          {/* OTHER LANGUAGES */}
          {showAll &&
            otherLanguages.map((lang) => (
              <div
                key={lang.code}
                className="relative bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:border-orange-500 hover:shadow-md transition-all group animate-in fade-in slide-in-from-bottom-2"
              >
                {/* 🔊 Speaker */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakLanguage(lang);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition"
                  aria-label={`Speak ${lang.name}`}
                >
                  <i className="fa-solid fa-volume-high text-xs"></i>
                </button>

                {/* Language Select */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLanguageClick(lang.code);
                  }}
                  className="flex flex-col items-center justify-center"
                >
                  <span className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600">
                    {lang.nativeName}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-orange-400">
                    {lang.name}
                  </span>
                </button>
              </div>
            ))}
        </div>

        {/* Toggle Button outside the grid at the bottom */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAll(!showAll);
          }}
          className="mt-6 w-full py-4 text-orange-600 font-black text-xs uppercase bg-orange-50 rounded-2xl border border-orange-100 hover:bg-orange-100 hover:border-orange-200 transition-all active:scale-[0.98]"
        >
          {showAll ? "Show fewer languages" : "View More Languages"}{" "}
          <i
            className={`fa-solid ${showAll ? "fa-chevron-up" : "fa-chevron-down"} ml-2`}
          ></i>
        </button>
      </div>

      {/* Confirmation Dialog */}
      {pendingLanguage && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-[32px] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
              <i className="fa-solid fa-circle-question"></i>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-3">
              Change language?
            </h2>
            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-8">
              Some text on this screen may change. Your data will not be lost.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => onSelect(pendingLanguage)}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all"
              >
                Change Language
              </button>
              <button
                onClick={() => setPendingLanguage(null)}
                className="w-full py-4 bg-white text-slate-400 font-black uppercase text-[10px] tracking-widest active:bg-slate-50 transition-all rounded-2xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default LanguageSelectionView;
