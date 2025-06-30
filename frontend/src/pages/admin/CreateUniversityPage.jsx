import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function CreateUniversityPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error(t("admin.universityNameRequired"));
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API}/admin/universities`,
        { name },
        { withCredentials: true }
      );
      toast.success(t("admin.universityCreated"));
      navigate("/admin/universities");
    } catch {
      toast.error(t("admin.universityCreateFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t("admin.createUniversity")}</h2>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
          className="text-sm text-blue-600 underline"
        >
          {i18n.language === "ar" ? "English" : "العربية"}
        </button>
      </div>

      <label className="block mb-2 font-semibold">{t("admin.universityName")}</label>
      <input
        className="border px-3 py-2 rounded w-full mb-4"
        placeholder={t("admin.universityNamePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={handleCreate}
        className="bg-green-600 text-white px-6 py-2 rounded"
        disabled={loading}
      >
        {loading ? t("admin.creating") : t("admin.create")}
      </button>
    </div>
  );
}