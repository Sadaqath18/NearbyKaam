type AuthStrings = {
  otpInstruction: string;
  otpSent: (phone: string) => string;
  verifyOtp: string;
  tapToHear: string;
};

const AUTH_STRINGS: Record<string, AuthStrings> = {
  en: {
    otpInstruction: "Please enter the 6 digit OTP sent to your mobile number.",
    otpSent: (phone) => `OTP has been sent to your mobile number ${phone}.`,
    verifyOtp: "Verify OTP",
    tapToHear: "Tap to hear instructions",
  },

  hi: {
    otpInstruction:
      "कृपया अपने मोबाइल नंबर पर भेजा गया 6 अंकों का ओटीपी दर्ज करें।",
    otpSent: (phone) => `आपके मोबाइल नंबर ${phone} पर ओटीपी भेजा गया है।`,
    verifyOtp: "ओटीपी सत्यापित करें",
    tapToHear: "निर्देश सुनने के लिए यहाँ दबाएँ",
  },

  kn: {
    otpInstruction:
      "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಕಳುಹಿಸಲಾದ 6 ಅಂಕಿಯ OTP ಅನ್ನು ನಮೂದಿಸಿ.",
    otpSent: (phone) => `ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ${phone} ಗೆ OTP ಕಳುಹಿಸಲಾಗಿದೆ.`,
    verifyOtp: "OTP ಪರಿಶೀಲಿಸಿ",
    tapToHear: "ಸೂಚನೆಗಳನ್ನು ಕೇಳಲು ಇಲ್ಲಿ ಒತ್ತಿರಿ",
  },

  mr: {
    otpInstruction: "कृपया तुमच्या मोबाईल नंबरवर पाठवलेला 6 अंकी OTP टाका.",
    otpSent: (phone) =>
      `तुमच्या मोबाईल नंबर ${phone} वर OTP पाठवण्यात आला आहे.`,
    verifyOtp: "OTP तपासा",
    tapToHear: "सूचना ऐकण्यासाठी येथे टॅप करा",
  },

  te: {
    otpInstruction:
      "దయచేసి మీ మొబైల్ నంబర్‌కు పంపిన 6 అంకెల OTP ని నమోదు చేయండి.",
    otpSent: (phone) => `మీ మొబైల్ నంబర్ ${phone} కు OTP పంపబడింది.`,
    verifyOtp: "OTP ధృవీకరించండి",
    tapToHear: "సూచనలు వినడానికి ఇక్కడ నొక్కండి",
  },

  ta: {
    otpInstruction:
      "உங்கள் கைபேசி எண்ணுக்கு அனுப்பப்பட்ட 6 இலக்க OTP ஐ உள்ளிடவும்.",
    otpSent: (phone) =>
      `உங்கள் கைபேசி எண் ${phone} க்கு OTP அனுப்பப்பட்டுள்ளது.`,
    verifyOtp: "OTP சரிபார்க்கவும்",
    tapToHear: "வழிமுறைகளை கேட்க இங்கே தட்டவும்",
  },

  ur: {
    otpInstruction:
      "براہ کرم اپنے موبائل نمبر پر بھیجا گیا 6 ہندسوں کا OTP درج کریں۔",
    otpSent: (phone) => `آپ کے موبائل نمبر ${phone} پر OTP بھیج دیا گیا ہے۔`,
    verifyOtp: "OTP کی تصدیق کریں",
    tapToHear: "ہدایات سننے کے لیے یہاں دبائیں",
  },

  ml: {
    otpInstruction:
      "ദയവായി നിങ്ങളുടെ മൊബൈൽ നമ്പറിലേക്ക് അയച്ച 6 അക്ക OTP നൽകുക.",
    otpSent: (phone) =>
      `നിങ്ങളുടെ മൊബൈൽ നമ്പർ ${phone} ലേക്ക് OTP അയച്ചിരിക്കുന്നു.`,
    verifyOtp: "OTP സ്ഥിരീകരിക്കുക",
    tapToHear: "നിർദ്ദേശങ്ങൾ കേൾക്കാൻ ഇവിടെ ടാപ്പ് ചെയ്യുക",
  },

  gu: {
    otpInstruction:
      "કૃપા કરીને તમારા મોબાઇલ નંબર પર મોકલાયેલ 6 અંકનો OTP દાખલ કરો.",
    otpSent: (phone) => `તમારા મોબાઇલ નંબર ${phone} પર OTP મોકલાયો છે.`,
    verifyOtp: "OTP ચકાસો",
    tapToHear: "સૂચનાઓ સાંભળવા અહીં ટેપ કરો",
  },

  bn: {
    otpInstruction:
      "অনুগ্রহ করে আপনার মোবাইল নম্বরে পাঠানো ৬ সংখ্যার OTP লিখুন।",
    otpSent: (phone) => `আপনার মোবাইল নম্বর ${phone} এ OTP পাঠানো হয়েছে।`,
    verifyOtp: "OTP যাচাই করুন",
    tapToHear: "নির্দেশ শুনতে এখানে ট্যাপ করুন",
  },

  pa: {
    otpInstruction:
      "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਮੋਬਾਈਲ ਨੰਬਰ ‘ਤੇ ਭੇਜਿਆ ਗਿਆ 6 ਅੰਕਾਂ ਦਾ OTP ਦਰਜ ਕਰੋ।",
    otpSent: (phone) => `ਤੁਹਾਡੇ ਮੋਬਾਈਲ ਨੰਬਰ ${phone} ‘ਤੇ OTP ਭੇਜਿਆ ਗਿਆ ਹੈ।`,
    verifyOtp: "OTP ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    tapToHear: "ਹਦਾਇਤਾਂ ਸੁਣਨ ਲਈ ਇੱਥੇ ਟੈਪ ਕਰੋ",
  },

  or: {
    otpInstruction:
      "ଦୟାକରି ଆପଣଙ୍କ ମୋବାଇଲ୍ ନମ୍ବରକୁ ପଠାଯାଇଥିବା 6 ଅଙ୍କର OTP ଭରନ୍ତୁ।",
    otpSent: (phone) => `ଆପଣଙ୍କ ମୋବାଇଲ୍ ନମ୍ବର ${phone} କୁ OTP ପଠାଯାଇଛି।`,
    verifyOtp: "OTP ସତ୍ୟାପନ କରନ୍ତୁ",
    tapToHear: "ନିର୍ଦ୍ଦେଶ ଶୁଣିବାକୁ ଏଠାରେ ଟାପ୍ କରନ୍ତୁ",
  },

  as: {
    otpInstruction:
      "অনুগ্ৰহ কৰি আপোনাৰ মোবাইল নম্বৰত পঠোৱা ৬ অংকৰ OTP প্ৰৱেশ কৰক।",
    otpSent: (phone) => `আপোনাৰ মোবাইল নম্বৰ ${phone} লৈ OTP পঠোৱা হৈছে।`,
    verifyOtp: "OTP নিশ্চিত কৰক",
    tapToHear: "নিৰ্দেশ শুনিবলৈ ইয়াত টেপ কৰক",
  },

  ks: {
    otpInstruction:
      "مہربانی کر کے اپنے موبائل نمبر پر بھیجا گیا 6 ہندسوں کا OTP درج کریں۔",
    otpSent: (phone) => `آپ کے موبائل نمبر ${phone} پر OTP بھیجا گیا ہے۔`,
    verifyOtp: "OTP کی تصدیق کریں",
    tapToHear: "ہدایت سننے کے لیے یہاں دبائیں",
  },

  sd: {
    otpInstruction:
      "مهرباني ڪري پنهنجي موبائل نمبر تي موڪليل 6 عدد OTP داخل ڪريو.",
    otpSent: (phone) => `توهان جي موبائل نمبر ${phone} تي OTP موڪليو ويو آهي.`,
    verifyOtp: "OTP تصديق ڪريو",
    tapToHear: "هدايتون ٻڌڻ لاءِ هتي ٽيپ ڪريو",
  },

  ne: {
    otpInstruction:
      "कृपया तपाईंको मोबाइल नम्बरमा पठाइएको ६ अङ्कको OTP प्रविष्ट गर्नुहोस्।",
    otpSent: (phone) => `तपाईंको मोबाइल नम्बर ${phone} मा OTP पठाइएको छ।`,
    verifyOtp: "OTP प्रमाणित गर्नुहोस्",
    tapToHear: "निर्देशन सुन्न यहाँ ट्याप गर्नुहोस्",
  },
};

export default AUTH_STRINGS;
