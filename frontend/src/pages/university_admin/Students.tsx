import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function StudentsPage() {
  const { token } = useAuth();
  const { t, i18n } = useTranslation(); // ✅ no namespace passed

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "Students - University Admin";
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (debounceTimeout) clearTimeout(debounceTimeout);
    const timeout = setTimeout(async () => {
      if (!value) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`${API}/students/search?query=${value}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data);
      } catch (err) {
        console.error("Search failed", err);
      }
      setLoading(false);
    }, 400);

    setDebounceTimeout(timeout);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 py-10 bg-gray-50"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="self-end mb-4">
        <button
          onClick={toggleLanguage}
          className="text-sm text-blue-600 underline"
        >
          {i18n.language === "ar" ? "English" : "العربية"}
        </button>
      </div>

      <Link
        to="/university/register-student"
        className="mb-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded shadow"
      >
        ➕ {t("university.add_student")}
      </Link>

      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={t("university.search_placeholder")}
        className="w-full max-w-md border border-gray-300 px-4 py-2 rounded shadow-sm mb-6"
      />

      {loading && <p className="text-gray-600">{t("university.searching")}</p>}

      <div className="w-full max-w-2xl space-y-3">
        {results.length > 0 ? (
          results.map((student: any) => (
            <Link
              to={`/university/students/${student.id}`}
              key={student.id}
              className="block bg-white p-4 shadow rounded border hover:bg-blue-50"
            >
              <h3 className="text-lg font-semibold">{student.name}</h3>
              <p className="text-sm text-gray-700">📞 {student.phone_number}</p>
              {student.parent_name && (
                <p className="text-sm text-gray-500">
                  👨‍👩‍👧 {t("university.parent")}: {student.parent_name}
                </p>
              )}
            </Link>
          ))
        ) : (
          query && !loading && (
            <p className="text-gray-500">{t("university.no_students_found")}</p>
          )
        )}
      </div>
    </div>
  );
}