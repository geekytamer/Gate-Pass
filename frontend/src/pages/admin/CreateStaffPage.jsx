import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const API = process.env.REACT_APP_API_URL;

export default function CreateStaffPage() {
  const { id: universityId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = "Create Staff - GatePass Admin";
  }, []);

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
      toast.success(t("admin.successCreated"));
      navigate(`/admin/universities/${universityId}`);
    } catch (err) {
      console.error(err);
      toast.error(t("admin.failedCreated"));
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t("admin.addStaff")}</h2>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
          className="text-sm text-blue-600 underline"
        >
          {i18n.language === "ar" ? "English" : "العربية"}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          placeholder={t("admin.name")}
          className="input w-full"
          onChange={handleChange}
          required
        />
        <input
          name="phone_number"
          type="text"
          placeholder={t("admin.phone")}
          className="input w-full"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder={t("admin.password")}
          className="input w-full"
          onChange={handleChange}
          required
        />
        <select
          name="role"
          className="select w-full"
          onChange={handleChange}
          value={form.role}
        >
          <option value="staff">{t("admin.role.staff")}</option>
          <option value="university_admin">{t("admin.role.university_admin")}</option>
        </select>
        <button type="submit" className="btn btn-primary w-full">
          {t("admin.save")}
        </button>
      </form>
    </div>
  );
}