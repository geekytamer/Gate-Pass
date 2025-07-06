import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function BusesPage() {
  const { token } = useAuth();
  const { t, i18n } = useTranslation();

  const [buses, setBuses] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [form, setForm] = useState({
    name: "",
    destination_district: "",
    accommodation_id: "",
  });
  const [busToDelete, setBusToDelete] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Manage Buses - University Admin";
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const busRes = await axios.get(`${API}/university/buses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBuses(busRes.data);

        const accRes = await axios.get(`${API}/accommodations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccommodations(accRes.data);
      } catch (err) {
        console.error("Error loading buses or accommodations", err);
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/university/buses`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: "", destination_district: "", accommodation_id: "" });
      const res = await axios.get(`${API}/university/buses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuses(res.data);
    } catch {
      alert(t("university.errorAddBus"));
    }
  };

  const handleDelete = async () => {
    if (!busToDelete) return;
    try {
      await axios.delete(`${API}/university/buses/${busToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuses(buses.filter((b: any) => b.id !== busToDelete));
      setBusToDelete(null);
    } catch {
      alert(t("university.errorDeleteBus"));
    }
  };

  return (
    <div className="p-6" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("university.manageBuses")}</h1>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
          className="text-sm text-blue-600 underline"
        >
          {i18n.language === "ar" ? "English" : "العربية"}
        </button>
      </div>

      <form
        onSubmit={handleBusSubmit}
        className="space-y-4 mb-10 bg-white p-6 shadow rounded max-w-xl"
      >
        <h2 className="text-lg font-semibold">{t("university.addNewBus")}</h2>

        <input
          type="text"
          name="name"
          placeholder={t("university.busName")}
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="text"
          name="destination_district"
          placeholder={t("university.destination")}
          value={form.destination_district}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <select
          name="accommodation_id"
          value={form.accommodation_id}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">{t("university.selectAccommodation")}</option>
          {accommodations.map((acc: any) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {t("university.addBus")}
        </button>
      </form>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200 text-left text-sm">
          <tr>
            <th className="p-2">{t("university.busName")}</th>
            <th className="p-2">{t("university.destination")}</th>
            <th className="p-2">{t("university.accommodation")}</th>
            <th className="p-2">{t("university.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus: any) => (
            <tr key={bus.id} className="border-t">
              <td className="p-2">{bus.name}</td>
              <td className="p-2">{bus.destination_district}</td>
              <td className="p-2">{bus.accommodation_name || "N/A"}</td>
              <td className="p-2">
                <button
                  onClick={() => setBusToDelete(bus.id)}
                  className="text-red-600 hover:underline"
                >
                  {t("university.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {busToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <p className="mb-4 text-lg font-medium">{t("university.confirmDeleteBus")}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setBusToDelete(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                {t("university.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {t("university.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}