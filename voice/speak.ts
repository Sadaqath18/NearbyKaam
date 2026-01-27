export const speak = (text: string, lang: string) => {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = mapLangCode(lang); // IMPORTANT
  u.rate = 0.95;
  u.pitch = 1;

  window.speechSynthesis.speak(u);
};

const mapLangCode = (l: string) => {
  const map: Record<string, string> = {
    hi: "hi-IN",
    kn: "kn-IN",
    ta: "ta-IN",
    te: "te-IN",
    ml: "ml-IN",
    mr: "mr-IN",
    gu: "gu-IN",
    bn: "bn-IN",
    pa: "pa-IN",
    ur: "ur-PK",
    en: "en-IN",
  };
  return map[l] || "en-IN";
};
