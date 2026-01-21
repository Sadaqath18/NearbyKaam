import React, { useState } from "react";
import { User, UserRole, AdminPermission } from "../../types";

interface Props {
  onCreate: (admin: User) => void;
  onClose: () => void;
}

const CreateAdminModal: React.FC<Props> = ({ onCreate, onClose }) => {
  const [phone, setPhone] = useState("");

  const handleSubmit = () => {
    if (!phone) return;

    const admin: User = {
      phone,
      role: UserRole.ADMIN,
      isAuthenticated: true,
      profileCompleted: true,
      permissions: [AdminPermission.FULL_ACCESS],
    };

    onCreate(admin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6">
        <h2 className="text-lg font-black mb-4">Create Admin</h2>

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mb-4 border p-2 rounded"
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

export default CreateAdminModal;
