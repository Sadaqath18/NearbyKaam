
import React, { useState, useEffect } from 'react';
import { UserRole, Job, JobStatus, User, AdminPermission, JobCategory, EmployerProfile } from './types';
import WorkerView from './views/WorkerView';
import EmployerView from './views/EmployerView';
import AdminView from './views/AdminView';
import LanguageSelectionView from './views/LanguageSelectionView';
import AuthView from './views/AuthView';
import EmployerProfileDrawer from './components/EmployerProfileDrawer';
import { MOCK_JOBS, LANGUAGES } from './constants';
import { stopSpeaking, speakText } from './services/geminiService';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nearbykaam_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('nearbykaam_jobs_v3');
    return saved ? JSON.parse(saved) : MOCK_JOBS;
  });
  
  const [language, setLanguage] = useState<string | null>(localStorage.getItem('nearbykaam_lang'));
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEmployerProfileOpen, setIsEmployerProfileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (isChangingLanguage) {
      window.history.pushState({ langModal: true }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (isChangingLanguage) {
        setIsChangingLanguage(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isChangingLanguage]);

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

  useEffect(() => {
    const playGreeting = async () => {
      if (language && (currentUser || isGuest) && !sessionStorage.getItem('APP_GREETING_PLAYED')) {
        sessionStorage.setItem('APP_GREETING_PLAYED', 'true');
        
        let greeting = "Welcome! Jobs near you are ready.";
        
        if (language !== 'en') {
          try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const langName = LANGUAGES.find(l => l.code === language)?.name || 'Hindi';
            const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: `Translate the following phrase to ${langName} for a friendly voice greeting: "Welcome! Jobs near you are ready." Return ONLY the translated text.`
            });
            const translated = response.text.trim();
            if (translated) greeting = translated;
          } catch (error) {
            console.error("Welcome translation failed", error);
          }
        }
        
        speakText(greeting, language);
      }
    };

    playGreeting();
  }, [language, currentUser, isGuest]);

  const updateJobsAtomic = (updater: (prev: Job[]) => Job[]) => {
    setJobs(prev => {
      const next = updater(prev);
      localStorage.setItem('nearbykaam_jobs_v3', JSON.stringify(next));
      return next;
    });
  };

  const handleLogin = (role: UserRole, phone: string) => {
    let profileCompleted = false;
    let workerProfile = undefined;
    let employerProfile = undefined;
    
    if (role === UserRole.WORKER) {
      const savedProfile = localStorage.getItem('nearbykaam_worker_profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.phone === phone && p.name) {
          profileCompleted = true;
          workerProfile = p;
        }
      }
    } else if (role === UserRole.EMPLOYER) {
      const savedEProfile = localStorage.getItem(`nearbykaam_employer_profile_${phone}`);
      if (savedEProfile) {
        const p = JSON.parse(savedEProfile);
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
      profileCompleted: profileCompleted,
      workerProfile,
      employerProfile,
      permissions: role === UserRole.ADMIN ? [AdminPermission.FULL_ACCESS] : []
    };
    setCurrentUser(user);
    setIsGuest(false);
    setShowAuthModal(false);
    localStorage.setItem('nearbykaam_user', JSON.stringify(user));

    if (role === UserRole.WORKER && !profileCompleted) {
      setIsProfileOpen(true);
    } else if (role === UserRole.EMPLOYER && !profileCompleted) {
      setIsEmployerProfileOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsGuest(false);
    setShowAuthModal(false);
    localStorage.removeItem('nearbykaam_user');
    sessionStorage.removeItem('APP_GREETING_PLAYED');
    stopSpeaking();
  };

  const handleProfileCompleted = () => {
    if (currentUser) {
      const updatedUser = { ...currentUser, profileCompleted: true };
      setCurrentUser(updatedUser);
      localStorage.setItem('nearbykaam_user', JSON.stringify(updatedUser));
    }
  };

  const handleEmployerProfileSave = (p: EmployerProfile) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, employerProfile: p, profileCompleted: true };
      setCurrentUser(updatedUser);
      localStorage.setItem(`nearbykaam_employer_profile_${currentUser.phone}`, JSON.stringify(p));
      localStorage.setItem('nearbykaam_user', JSON.stringify(updatedUser));
      setIsEmployerProfileOpen(false);
    }
  };

  const handleLanguageSelect = (code: string) => {
    setLanguage(code);
    localStorage.setItem('nearbykaam_lang', code);
    
    if (isChangingLanguage) {
      setIsChangingLanguage(false);
      if (window.history.state?.langModal) {
        window.history.back();
      }
    }
  };

  const handleInternalBack = () => {
    if (window.history.state?.langModal) {
      window.history.back();
    } else {
      setIsChangingLanguage(false);
    }
  };

  const renderContent = () => {
    if (!currentUser && !isGuest) {
      return (
        <AuthView 
          onLogin={handleLogin} 
          onAdminLogin={(phone) => handleLogin(UserRole.ADMIN, phone)} 
          onGuestAccess={() => setIsGuest(true)} 
          language={language || 'en'}
          onChangeLanguage={() => setIsChangingLanguage(true)}
        />
      );
    }

    const activeRole = currentUser?.role || UserRole.WORKER;
    switch(activeRole) {
      case UserRole.WORKER:
        return (
          <WorkerView 
            jobs={jobs} 
            onReport={(id) => updateJobsAtomic(prev => prev.map(j => j.id === id ? {...j, isReported: true} : j))} 
            language={language || 'en'} 
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
              profile={currentUser?.employerProfile || { firstName: '', phone: currentUser?.phone || '', shopName: '', industry: '', location: null, shopPhoto: null, createdAt: new Date().toISOString() }}
              onSave={handleEmployerProfileSave}
              isMandatory={!currentUser?.profileCompleted}
            />
            <EmployerView 
              onJobSubmit={(job) => updateJobsAtomic(prev => [...prev, job])} 
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
            onUpdateStatus={async (id, status, p) => updateJobsAtomic(prev => prev.map(j => j.id === id ? {...j, status, ...p} : j))} 
            onDelete={(id) => updateJobsAtomic(prev => prev.filter(j => j.id !== id))} 
            onClearReport={(id) => updateJobsAtomic(prev => prev.map(j => j.id === id ? {...j, isReported: false} : j))} 
            onVerifyEmployer={(id) => updateJobsAtomic(prev => prev.map(j => j.id === id ? {...j, isVerified: true} : j))} 
            onLogout={handleLogout}
          />
        );
      default:
        return <WorkerView jobs={jobs} onReport={() => {}} language={language || 'en'} onChangeLanguage={() => setIsChangingLanguage(true)} isGuest={isGuest} currentUser={currentUser} onProfileCompleted={handleProfileCompleted} onAuthRequired={() => setShowAuthModal(true)} onLogout={handleLogout} isProfileOpen={isProfileOpen} setIsProfileOpen={setIsProfileOpen} />;
    }
  };

  if (!language || isChangingLanguage) {
    return (
      <div className="max-w-md mx-auto h-screen bg-white">
        <LanguageSelectionView 
          onSelect={handleLanguageSelect} 
          onBack={isChangingLanguage ? handleInternalBack : undefined}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 flex flex-col relative shadow-2xl overflow-hidden border-x border-slate-200">
      <div className="flex-1 overflow-hidden">{renderContent()}</div>

      {(currentUser || isGuest) && (
        <nav className="bg-white border-t border-slate-100 h-20 flex justify-around items-center shrink-0 z-50 px-8">
          <button 
            title="Jobs Feed"
            className={`flex flex-col items-center gap-1 ${(!currentUser || currentUser.role === UserRole.WORKER) ? 'text-orange-500' : 'text-indigo-600'}`}
          >
            <i className="text-xl fa-solid fa-briefcase"></i>
            <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
          </button>
          
          <button 
            title={isGuest ? "Login Required" : "My Profile & Resume"}
            onClick={() => {
              if (isGuest) setShowAuthModal(true);
              else if (currentUser?.role === UserRole.EMPLOYER) setIsEmployerProfileOpen(true);
              else setIsProfileOpen(true);
            }} 
            className={`flex flex-col items-center gap-1 text-slate-300 active:text-orange-500 ${isGuest ? 'opacity-50' : ''}`}
          >
            <i className="text-xl fa-solid fa-user"></i>
            <span className="text-[8px] font-black uppercase tracking-widest">My Profile</span>
          </button>
        </nav>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-[32px] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
              <i className="fa-solid fa-lock"></i>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-3">Login Required</h2>
            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-8">
              Please login or create an account to access this feature and connect with employers.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                title="Go to Login screen"
                onClick={() => {
                  setShowAuthModal(false);
                  setIsGuest(false);
                  setCurrentUser(null);
                }}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all"
              >
                Login Now
              </button>
              <button 
                title="Dismiss modal"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-4 bg-white text-slate-400 font-black uppercase text-[10px] tracking-widest active:bg-slate-50 transition-all rounded-2xl"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
