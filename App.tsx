import { useState } from "react";
import {
  UserRole,
  User,
  Job,
  WorkerProfile,
  EmployerProfile,
  AdminPermission,
} from "./types";

import WorkerView from "./views/WorkerView";
import EmployerView from "./views/EmployerView";
import AdminView from "./views/AdminView";
import AuthView from "./views/AuthView";
import LanguageSelectionView from "./views/LanguageSelectionView";

import WorkerProfileDrawer from "./components/WorkerProfileDrawer";
import EmployerProfileDrawer from "./components/EmployerProfileDrawer";

import { MOCK_JOBS } from "./constants";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [language, setLanguage] = useState<string | null>(null);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEmployerProfileOpen, setIsEmployerProfileOpen] = useState(false);

  const [workerProfile, setWorkerProfile] = useState<WorkerProfile>({
    name: "",
    phone: "",
    email: "",
    jobType: "OTHER" as any,
    preferredJobTitle: "",
    expectedMonthlySalary: 0,
    expectedDailyWage: 0,
    location: null,
    resume: { hasAudio: false, hasDocument: false },
    createdAt: new Date().toISOString(),
  });

  const [employerProfile, setEmployerProfile] = useState<EmployerProfile>({
    firstName: "",
    phone: "",
    shopName: "",
    industry: "",
    location: null,
    shopPhoto: null,
    createdAt: new Date().toISOString(),
  });

  const handleLogin = (role: UserRole, phone: string) => {
    const user: User = {
      role,
      phone,
      isAuthenticated: true,
      profileCompleted: false,
      workerProfile: role === UserRole.WORKER ? workerProfile : undefined,
      employerProfile: role === UserRole.EMPLOYER ? employerProfile : undefined,
      permissions: role === UserRole.ADMIN ? [AdminPermission.FULL_ACCESS] : [],
    };

    setCurrentUser(user);
    setIsGuest(false);

    if (role === UserRole.WORKER) setIsProfileOpen(true);
    if (role === UserRole.EMPLOYER) setIsEmployerProfileOpen(true);
  };

  /* 🌐 Language */
  if (!language || isChangingLanguage) {
    return (
      <div className="max-w-md mx-auto h-screen bg-white">
        <LanguageSelectionView
          onSelect={(code) => {
            setLanguage(code);
            setIsChangingLanguage(false);
          }}
          onBack={
            isChangingLanguage ? () => setIsChangingLanguage(false) : undefined
          }
        />
      </div>
    );
  }

  /* 🔐 Auth */
  if (!currentUser && !isGuest) {
    return (
      <AuthView
        onLogin={handleLogin}
        onAdminLogin={(phone) => handleLogin(UserRole.ADMIN, phone)}
        onGuestAccess={() => setIsGuest(true)}
        language={language}
        onChangeLanguage={() => setIsChangingLanguage(true)}
      />
    );
  }

  /* 👷 Worker */
  if (currentUser?.role === UserRole.WORKER || isGuest) {
    return (
      <>
        <WorkerProfileDrawer
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={workerProfile}
          onSave={(p) => {
            setWorkerProfile(p);
            setIsProfileOpen(false);
            if (currentUser)
              setCurrentUser({ ...currentUser, profileCompleted: true });
          }}
          onChangeLanguage={() => setIsChangingLanguage(true)}
          isMandatory={
            currentUser?.isAuthenticated && !currentUser.profileCompleted
          }
        />

        <WorkerView
          jobs={jobs}
          onReport={() => {}}
          language={language}
          onChangeLanguage={() => setIsChangingLanguage(true)}
          isGuest={isGuest}
          currentUser={currentUser}
          onProfileCompleted={() => {}}
          onAuthRequired={() => {}}
          onLogout={() => {
            setCurrentUser(null);
            setIsGuest(false);
          }}
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
        />
      </>
    );
  }

  /* 🧑‍💼 Employer */
  if (currentUser?.role === UserRole.EMPLOYER) {
    return (
      <>
        <EmployerProfileDrawer
          isOpen={isEmployerProfileOpen}
          onClose={() => setIsEmployerProfileOpen(false)}
          profile={employerProfile}
          onSave={(p) => {
            setEmployerProfile(p);
            setIsEmployerProfileOpen(false);
            if (currentUser)
              setCurrentUser({ ...currentUser, profileCompleted: true });
          }}
          isMandatory={!currentUser.profileCompleted}
        />

        <EmployerView
          onJobSubmit={(job) => setJobs((prev) => [...prev, job])}
          allJobs={jobs}
          onChangeLanguage={() => setIsChangingLanguage(true)}
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
        />
      </>
    );
  }

  /* 🛡 Admin */
  if (currentUser?.role === UserRole.ADMIN) {
    return (
      <AdminView
        jobs={jobs}
        onUpdateStatus={async (id, status, p) => {
          setJobs((prev) =>
            prev.map((j) => (j.id === id ? { ...j, status, ...p } : j))
          );
        }}
        onDelete={async (id) => {
          setJobs((prev) => prev.filter((j) => j.id !== id));
        }}
        onClearReport={async (id) => {
          setJobs((prev) =>
            prev.map((j) => (j.id === id ? { ...j, isReported: false } : j))
          );
        }}
        onVerifyEmployer={async (id) => {
          setJobs((prev) =>
            prev.map((j) => (j.id === id ? { ...j, isVerified: true } : j))
          );
        }}
        onLogout={() => setCurrentUser(null)}
      />
    );
  }

  return null;
}
