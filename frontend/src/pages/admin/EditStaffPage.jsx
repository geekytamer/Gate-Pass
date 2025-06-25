// src/pages/admin/EditStaffPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL;

export default function EditStaffPage() {
  const { id: universityId, staffId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    password: "",
    role: "staff",
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(`${API}/admin/universities/${universityId}/staff/${staffId}`);
        setForm({
          name: res.data.name,
          phone_number: res.data.phone_number,
          password: "", // password must be re-entered
          role: res.data.role,
        });
      } catch (err) {
        toast.error("❌ Failed to load staff data");
      }
    };
    fetchStaff();
  }, [universityId, staffId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/admin/universities/${universityId}/staff/${staffId}`, {
        name: form.name,
        phone_number: form.phone_number,
        hashed_password: form.password,
        role: form.role,
      });
      toast.success("✅ Staff member updated");
      navigate(`/admin/universities/${universityId}`);
    } catch (err) {
      toast.error("❌ Update failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">✏️ Edit Staff Member</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" type="text" className="input w-full" value={form.name} onChange={handleChange} required />
        <input name="phone_number" type="text" className="input w-full" value={form.phone_number} onChange={handleChange} required />
        <input name="password" type="password" className="input w-full" value={form.password} onChange={handleChange} required />
        <select name="role" className="select w-full" value={form.role} onChange={handleChange}>
          <option value="staff">Staff</option>
          <option value="university_admin">University Admin</option>
        </select>
        <button type="submit" className="btn btn-primary w-full">Update</button>
      </form>
    </div>
  );
}