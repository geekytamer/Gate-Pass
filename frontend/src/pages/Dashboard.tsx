import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function DashboardPage() {
  const { logout, user } = useAuth();
  const { t, i18n } = useTranslation();

  const isAdmin = user?.role === "admin";
  const isUniversityAdmin = user?.role === "university_admin";
  const isStaff = user?.role === "staff";

  useEffect(() => {
      document.title = "GatePass Dashboard";
    }, []);
    
  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };


  return (
    <div
      className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center px-4"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLanguage}
          className="text-sm text-blue-600 underline"
        >
          {i18n.language === "ar" ? "English" : "العربية"}
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        {t("dashboard.welcome", { name: user?.name })}
      </h1>
      <p className="text-gray-600 mb-8 text-sm">
        {t("dashboard.loggedInAs")} <code>{user?.role}</code>
      </p>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        {isAdmin && (
          <>
            <Link
              to="/admin/universities"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded shadow"
            >
              {t("dashboard.manageUniversities")}
            </Link>
            <Link
              to="/admin/accommodations"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded shadow"
            >
              {t("dashboard.manageAccommodations")}
            </Link>
          </>
        )}

        {isUniversityAdmin && (
          <>
            <Link
              to="/university/students"
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded shadow"
            >
              {t("dashboard.students")}
            </Link>
            <Link
              to="/university/register-student"
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded shadow"
            >
              {t("dashboard.registerStudent")}
            </Link>
            <Link
              to="/university/buses"
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded shadow"
            >
              {t("dashboard.manageBuses")}
            </Link>
            <Link
              to="/university/requests"
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded shadow"
            >
              {t("dashboard.exitRequests")}
            </Link>
          </>
        )}

        {isStaff && (
          <Link
            to="/staff/scan"
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded shadow"
          >
            {t("dashboard.scanQr")}
          </Link>
        )}

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded shadow mt-6"
        >
          {t("dashboard.logout")}
        </button>
      </div>
    </div>
  );
}