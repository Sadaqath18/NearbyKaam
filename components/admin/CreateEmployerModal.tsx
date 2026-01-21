import React, { useState } from "react";
import { EmployerProfile, Location } from "../../types";

interface Props {
  onCreate: (employer: EmployerProfile) => void;
  onClose: () => void;
}

const CreateEmployerModal: React.FC<Props> = ({ onCreate, onClose }) => {
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [industry, setIndustry] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = () => {
    if (!firstName || !phone || !shopName) {
      alert("Name, phone and shop name are required");
      return;
    }

    const employer: EmployerProfile = {
      firstName,
      phone,
      shopName,
      industry,
      location: {
        address,
        state: "",
        city: "",
        lat: null,
        lng: null,
      } as Location,
      shopPhoto: null,
      createdAt: new Date().toISOString(),
    };

    onCreate(employer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95">
        <h2 className="text-xl font-black text-slate-900 mb-6 text-left">
          Create Employer
        </h2>

        <div className="space-y-4 text-left">
          <input
            aria-label="Owner name"
            placeholder="Owner name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold"
          />

          <input
            aria-label="Phone number"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold"
          />

          <input
            aria-label="Shop name"
            placeholder="Shop / Business name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold"
          />

          <input
            aria-label="Industry"
            placeholder="Industry (Hotel, Garage, Shop...)"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold"
          />

          <textarea
            aria-label="Business address"
            placeholder="Business address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-500 font-black uppercase text-[10px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-black uppercase text-[10px] shadow-lg"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEmployerModal;
