import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function StudentDetailsPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    accommodation: "",
    parent_name: "",
    parent_phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`${API}/students/${id}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(res.data);
        setFormData({
          name: res.data.name || "",
          phone_number: res.data.phone_number || "",
          accommodation: res.data.accommodation || "",
          parent_name: res.data.parent?.name || "",
          parent_phone: res.data.parent?.phone_number || "",
        });
      } catch (err) {
        setError("❌ Failed to fetch student details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API}/students/${id}`,
        {
          name: formData.name,
          phone_number: formData.phone_number,
          accommodation: formData.accommodation,
          parent_name: formData.parent_name,
          parent_phone: formData.parent_phone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Student updated successfully");
    } catch (err) {
      toast.error("❌ Failed to update student");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      await axios.delete(`${API}/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("🗑️ Student deleted");
      setTimeout(() => {
        navigate("/university/students");
      }, 1500);
    } catch (err) {
      toast.error("❌ Failed to delete student");
    }
  };

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-6">
      <Toaster />

      <h2 className="text-2xl font-bold mb-4">Edit Student</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Student Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Accommodation</label>
          <input
            type="text"
            name="accommodation"
            value={formData.accommodation}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Parent Info</h3>

          <div>
            <label className="block text-sm font-medium">Parent Name</label>
            <input
              type="text"
              name="parent_name"
              value={formData.parent_name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Parent Phone</label>
            <input
              type="text"
              name="parent_phone"
              value={formData.parent_phone}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={handleUpdate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          💾 Save Changes
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          🗑️ Delete Student
        </button>
      </div>
    </div>
  );
}