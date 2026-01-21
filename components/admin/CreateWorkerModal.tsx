import React, { useState } from "react";
import { WorkerProfile } from "../../types";

interface Props {
  onCreate: (worker: WorkerProfile) => void;
  onClose: () => void;
}

const CreateWorkerModal: React.FC<Props> = ({ onCreate, onClose }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredJobTitle, setPreferredJobTitle] = useState("");

  const handleSubmit = () => {
    if (!name || !phone) {
      alert("Name and phone required");
      return;
    }

    const worker: WorkerProfile = {
      name,
      phone,
      preferredJobTitle,
      resume: { hasAudio: false, hasDocument: false },
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("nearbykaam_worker_profile", JSON.stringify(worker));
    onCreate(worker);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-3xl p-6">
        <h2 className="text-lg font-black mb-4">Create Worker</h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 border p-2 rounded"
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mb-3 border p-2 rounded"
        />

        <input
          placeholder="Preferred Job"
          value={preferredJobTitle}
          onChange={(e) => setPreferredJobTitle(e.target.value)}
          className="w-full mb-3 border p-2 rounded"
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-indigo-600 text-white py-2 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkerModal;
