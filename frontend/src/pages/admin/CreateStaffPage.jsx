// src/pages/admin/CreateStaffPage.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL;

export default function CreateStaffPage() {
  const { id: universityId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    password: "",
    role: "staff",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/universities/${universityId}/staff`, {
        name: form.name,
        phone_number: form.phone_number,
        hashed_password: form.password,
        role: form.role,
      });
      toast.success("✅ Staff member created");
      navigate(`/admin/universities/${universityId}`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create staff member");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">➕ Add Staff Member</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" type="text" placeholder="Name" className="input w-full" onChange={handleChange} required />
        <input name="phone_number" type="text" placeholder="Phone number" className="input w-full" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" className="input w-full" onChange={handleChange} required />
        <select name="role" className="select w-full" onChange={handleChange} value={form.role}>
          <option value="staff">Staff</option>
          <option value="university_admin">University Admin</option>
        </select>
        <button type="submit" className="btn btn-primary w-full">Save</button>
      </form>
    </div>
  );
}