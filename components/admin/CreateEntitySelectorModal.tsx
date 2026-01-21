import React from "react";

interface Props {
  onSelect: (type: "JOB" | "EMPLOYER" | "WORKER" | "ADMIN") => void;
  onClose: () => void;
}

const CreateEntitySelectorModal: React.FC<Props> = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl animate-in zoom-in-95">
        <h2 className="text-lg font-black text-slate-900 mb-6 text-left">
          Create New
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onSelect("JOB")}
            className="p-4 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-xs uppercase"
          >
            ➕ Job
          </button>

          <button
            onClick={() => onSelect("EMPLOYER")}
            className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-xs uppercase"
          >
            🏪 Employer
          </button>

          <button
            onClick={() => onSelect("WORKER")}
            className="p-4 rounded-2xl bg-orange-50 text-orange-700 font-black text-xs uppercase"
          >
            👷 Worker
          </button>

          <button
            onClick={() => onSelect("ADMIN")}
            className="p-4 rounded-2xl bg-slate-100 text-slate-700 font-black text-xs uppercase"
          >
            🛡️ Admin
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 text-[10px] font-black uppercase text-slate-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateEntitySelectorModal;
