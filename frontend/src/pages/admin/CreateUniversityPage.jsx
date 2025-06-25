// src/pages/admin/CreateUniversityPage.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function CreateUniversityPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("University name is required");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API}/admin/universities`,
        { name },
        { withCredentials: true }
      );
      toast.success("University created");
      navigate("/admin/universities");
    } catch {
      toast.error("Failed to create university");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create New University</h2>

      <label className="block mb-2 font-semibold">University Name</label>
      <input
        className="border px-3 py-2 rounded w-full mb-4"
        placeholder="e.g., Sohar University"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={handleCreate}
        className="bg-green-600 text-white px-6 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create University"}
      </button>
    </div>
  );
}