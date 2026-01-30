import React from "react";

export type EmployerTab = "HOME" | "MY_JOBS" | "MATCHING_WORKERS" | "PROFILE";

interface EmployerBottomNavProps {
  activeTab: EmployerTab;
  onChange: (tab: EmployerTab) => void;
}

const EmployerBottomNav: React.FC<EmployerBottomNavProps> = ({
  activeTab,
  onChange,
}) => {
  const tabs: {
    id: EmployerTab;
    label: string;
    icon: string;
  }[] = [
    { id: "HOME", label: "Home", icon: "fa-house" },
    { id: "MY_JOBS", label: "My Jobs", icon: "fa-briefcase" },
    { id: "MATCHING_WORKERS", label: "Workers", icon: "fa-users" },
    { id: "PROFILE", label: "Profile", icon: "fa-user" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-slate-200">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 ${
                isActive ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              <i
                className={`fa-solid ${tab.icon} text-lg ${
                  isActive ? "scale-110" : ""
                }`}
              ></i>
              <span className="text-[9px] font-black uppercase tracking-widest">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EmployerBottomNav;
