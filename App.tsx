import React, { useState, useEffect } from "react";
import { UserRole, Job, User, AdminPermission, EmployerProfile } from "./types";

import WorkerView from "./views/WorkerView";
import EmployerView from "./views/EmployerView";
import AdminView from "./views/AdminView";
import LanguageSelectionView from "./views/LanguageSelectionView";
import AuthView from "./views/AuthView";
import EmployerProfileDrawer from "./components/EmployerProfileDrawer";

import { MOCK_JOBS, LANGUAGES } from "./constants";
import { stopSpeaking, speakText } from "./services/geminiService";
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  /* ---------------- User ---------------- */
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("nearbykaam_user");
    return saved ? JSON.parse(saved) : null;
  });

  /* ---------------- Jobs ---------------- */
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem("nearbykaam_jobs_v3");
    return saved ? JSON.parse(saved) : MOCK_JOBS;
  });

  /* ---------------- Language (GLOBAL) ---------------- */
  const [language, setLanguage] = useState<string>(
    localStorage.getItem("nearbykaam_lang") || "en",
  );
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  /* ---------------- UI Flags ---------------- */
  const [isGuest, setIsGuest] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEmployerProfileOpen, setIsEmployerProfileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  /* ---------------- Language change (SINGLE SOURCE) ---------------- */
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("nearbykaam_lang", lang);
    setIsChangingLanguage(false);
  };

  /* ---------------- Language back navigation ---------------- */
  useEffect(() => {
    if (isChangingLanguage) {
      window.history.pushState({ langModal: true }, "");
    }

    const handlePopState = () => {
      if (isChangingLanguage) setIsChangingLanguage(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isChangingLanguage]);

  /* ---------------- Audio unlock (mobile) ---------------- */
  useEffect(() => {
    const unlockAudio = () => {
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(u);
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
      }
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  /* ---------------- Welcome greeting ---------------- */
  useEffect(() => {
    const playGreeting = async () => {
      if (
        language &&
        (currentUser || isGuest) &&
        !sessionStorage.getItem("APP_GREETING_PLAYED")
      ) {
        sessionStorage.setItem("APP_GREETING_PLAYED", "true");

        let greeting = "Welcome! Jobs near you are ready.";

        if (language !== "en") {
          try {
            const ai = new GoogleGenAI({
              apiKey: import.meta.env.VITE_GEMINI_API_KEY,
            });

            const langName =
              LANGUAGES.find((l) => l.code === language)?.name || "Hindi";

            const response = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: `Translate the following phrase to ${langName} for a friendly voice greeting:
              "Welcome! Jobs near you are ready."
              Return ONLY the translated text.`,
            });

            const translated = response.text?.trim();
            if (translated) greeting = translated;
          } catch (err) {
            console.error("Greeting translation failed", err);
          }
        }

        speakText(greeting, language);
      }
    };

    playGreeting();
  }, [language, currentUser, isGuest]);

  /* ---------------- Helpers ---------------- */
  const updateJobsAtomic = (updater: (prev: Job[]) => Job[]) => {
    setJobs((prev) => {
      const next = updater(prev);
      localStorage.setItem("nearbykaam_jobs_v3", JSON.stringify(next));
      return next;
    });
  };

  /* ---------------- Auth ---------------- */
  const handleLogin = (role: UserRole, phone: string) => {
    let profileCompleted = false;
    let workerProfile;
    let employerProfile;

    if (role === UserRole.WORKER) {
      const saved = localStorage.getItem("nearbykaam_worker_profile");
      if (saved) {
        const p = JSON.parse(saved);
        if (p.phone === phone && p.name) {
          profileCompleted = true;
          workerProfile = p;
        }
      }
    }

    if (role === UserRole.EMPLOYER) {
      const saved = localStorage.getItem(
        `nearbykaam_employer_profile_${phone}`,
      );
      if (saved) {
        const p = JSON.parse(saved);
        if (p.firstName && p.shopName) {
          profileCompleted = true;
          employerProfile = p;
        }
      }
    }

    const user: User = {
      role,
      phone,
      isAuthenticated: true,
      profileCompleted,
      workerProfile,
      employerProfile,
      permissions: role === UserRole.ADMIN ? [AdminPermission.FULL_ACCESS] : [],
    };

    setCurrentUser(user);
    setIsGuest(false);
    setShowAuthModal(false);
    localStorage.setItem("nearbykaam_user", JSON.stringify(user));

    if (role === UserRole.WORKER && !profileCompleted) setIsProfileOpen(true);
    if (role === UserRole.EMPLOYER && !profileCompleted)
      setIsEmployerProfileOpen(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsGuest(false);
    setShowAuthModal(false);
    localStorage.removeItem("nearbykaam_user");
    sessionStorage.removeItem("APP_GREETING_PLAYED");
    stopSpeaking();
  };

  const handleProfileCompleted = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, profileCompleted: true };
    setCurrentUser(updated);
    localStorage.setItem("nearbykaam_user", JSON.stringify(updated));
  };

  const handleEmployerProfileSave = (p: EmployerProfile) => {
    if (!currentUser) return;

    const updated = {
      ...currentUser,
      employerProfile: p,
      profileCompleted: true,
    };

    setCurrentUser(updated);
    localStorage.setItem(
      `nearbykaam_employer_profile_${currentUser.phone}`,
      JSON.stringify(p),
    );
    localStorage.setItem("nearbykaam_user", JSON.stringify(updated));
    setIsEmployerProfileOpen(false);
  };

  /* ---------------- Render main content ---------------- */
  const renderContent = () => {
    if (!currentUser && !isGuest) {
      return (
        <AuthView
          onLogin={handleLogin}
          onAdminLogin={(p) => handleLogin(UserRole.ADMIN, p)}
          onGuestAccess={() => setIsGuest(true)}
          language={language}
          onChangeLanguage={() => setIsChangingLanguage(true)}
        />
      );
    }

    switch (currentUser?.role || UserRole.WORKER) {
      case UserRole.WORKER:
        return (
          <WorkerView
            jobs={jobs}
            onReport={async (id) => {
              updateJobsAtomic((prev) =>
                prev.map((j) => (j.id === id ? { ...j, isReported: true } : j)),
              );
            }}
            language={language}
            onChangeLanguage={() => setIsChangingLanguage(true)}
            isGuest={isGuest}
            currentUser={currentUser}
            onProfileCompleted={handleProfileCompleted}
            onAuthRequired={() => setShowAuthModal(true)}
            onLogout={handleLogout}
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
          />
        );

      case UserRole.EMPLOYER:
        return (
          <div className="h-full flex flex-col relative">
            <EmployerProfileDrawer
              isOpen={isEmployerProfileOpen}
              onClose={() => setIsEmployerProfileOpen(false)}
              profile={
                currentUser?.employerProfile || {
                  firstName: "",
                  phone: currentUser?.phone || "",
                  shopName: "",
                  industry: "",
                  location: null,
                  shopPhoto: null,
                  createdAt: new Date().toISOString(),
                }
              }
              onSave={handleEmployerProfileSave}
              isMandatory={!currentUser?.profileCompleted}
            />
            <EmployerView
              onJobSubmit={(job) => updateJobsAtomic((prev) => [...prev, job])}
              allJobs={jobs}
              onChangeLanguage={() => setIsChangingLanguage(true)}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </div>
        );

      case UserRole.ADMIN:
        return (
          <AdminView
            jobs={jobs}
            onUpdateStatus={async (id, status, p) =>
              updateJobsAtomic((prev) =>
                prev.map((j) => (j.id === id ? { ...j, status, ...p } : j)),
              )
            }
            onDelete={(id) =>
              updateJobsAtomic((prev) => prev.filter((j) => j.id !== id))
            }
            onClearReport={(id) =>
              updateJobsAtomic((prev) =>
                prev.map((j) =>
                  j.id === id ? { ...j, isReported: false } : j,
                ),
              )
            }
            onVerifyEmployer={(id) =>
              updateJobsAtomic((prev) =>
                prev.map((j) => (j.id === id ? { ...j, isVerified: true } : j)),
              )
            }
            onLogout={handleLogout}
          />
        );
    }
  };

  /* ---------------- Language screen ---------------- */
  if (!language || isChangingLanguage) {
    return (
      <div className="max-w-md mx-auto h-screen bg-white">
        <LanguageSelectionView
          onSelect={changeLanguage}
          onBack={
            isChangingLanguage ? () => setIsChangingLanguage(false) : undefined
          }
        />
      </div>
    );
  }

  /* ---------------- App shell ---------------- */
  return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 flex flex-col relative shadow-2xl overflow-hidden border-x border-slate-200">
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  );
};

export default App;
