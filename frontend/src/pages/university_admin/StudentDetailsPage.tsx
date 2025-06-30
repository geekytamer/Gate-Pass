import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function StudentDetailsPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // ✅ no namespace

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
        setError(t("university.fetch_error"));
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
      toast.success(t("university.update_success"));
    } catch (err) {
      toast.error(t("university.update_failed"));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("university.delete_confirm"))) return;

    try {
      await axios.delete(`${API}/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t("university.delete_success"));
      setTimeout(() => {
        navigate("/university/students");
      }, 1500);
    } catch (err) {
      toast.error(t("university.delete_failed"));
    }
  };

  if (loading) return <p className="text-center mt-6">{t("university.loading")}</p>;
  if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;

  return (
    <div
      className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-6"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <Toaster />

      <h2 className="text-2xl font-bold mb-4">{t("university.edit_student")}</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">{t("university.student_name")}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">{t("university.phone_number")}</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">{t("university.accommodation")}</label>
          <input
            type="text"
            name="accommodation"
            value={formData.accommodation}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">{t("university.parent_info")}</h3>

          <div>
            <label className="block text-sm font-medium">{t("university.parent_name")}</label>
            <input
              type="text"
              name="parent_name"
              value={formData.parent_name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">{t("university.parent_phone")}</label>
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
          💾 {t("university.save_changes")}
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          🗑️ {t("university.delete_student")}
        </button>
      </div>
    </div>
  );
}