import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("admin./api/admin/statistics");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <div>{t("admin.loading")}</div>;

  return (
    <div className="p-6 space-y-6" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{t("admin.adminDashboard")}</h1>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
          className="text-sm text-blue-600 underline"
        >
          {i18n.language === "ar" ? "English" : "العربية"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <StatCard label={t("admin.universities")} count={stats.universities} />
        <StatCard label={t("admin.students")} count={stats.students} />
        <StatCard label={t("admin.staff")} count={stats.staff} />
        <StatCard label={t("admin.accommodations")} count={stats.accommodations} />
        <StatCard label={t("admin.buses")} count={stats.buses} />
      </div>
    </div>
  );
};

const StatCard = ({ label, count }) => (
  <div className="bg-white rounded shadow p-5">
    <div className="text-gray-500 text-sm">{label}</div>
    <div className="text-2xl font-bold">{count}</div>
  </div>
);

export default AdminDashboard;