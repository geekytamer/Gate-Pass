import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const API = process.env.REACT_APP_API_URL;

export default function EditStaffPage() {
  const { id: universityId, staffId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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
          password: "",
          role: res.data.role,
        });
      } catch (err) {
        toast.error(t("admin.errorLoad"));
      }
    };
    fetchStaff();
  }, [universityId, staffId, t]);

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
      toast.success(t("admin.success"));
      navigate(`/admin/universities/${universityId}`);
    } catch (err) {
      toast.error(t("admin.errorUpdate"));
    }
  };

  return (
    <div
      className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t("admin.title")}</h2>
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
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="phone_number"
          type="text"
          placeholder={t("admin.phone")}
          className="input w-full"
          value={form.phone_number}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder={t("admin.password")}
          className="input w-full"
          value={form.password}
          onChange={handleChange}
          required
        />
        <select
          name="role"
          className="select w-full"
          value={form.role}
          onChange={handleChange}
        >
          <option value="staff">{t("admin.staff")}</option>
          <option value="university_admin">{t("admin.admin")}</option>
        </select>
        <button type="submit" className="btn btn-primary w-full">
          {t("admin.update")}
        </button>
      </form>
    </div>
  );
}